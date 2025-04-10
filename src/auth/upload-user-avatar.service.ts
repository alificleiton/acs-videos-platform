import { Injectable, NotFoundException } from '@nestjs/common';
import { S3Client, PutObjectCommand, S3ServiceException } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as dotenv from 'dotenv';
import { User, UserDocument } from './schemas/user.schema';

dotenv.config();

@Injectable()
export class UploadUserAvatarService {
  private s3: S3Client;
  private bucketName = process.env.AWS_BUCKET_NAME;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !this.bucketName) {
      throw new Error("Missing AWS environment variables");
    }

    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<{ avatarUrl: string }> {
    if (!file || !file.buffer) {
      throw new Error('Arquivo inválido');
    }

    const fileExtension = file.originalname.split('.').pop();
    const fileKey = `users/avatars/${uuidv4()}.${fileExtension}`;

    try {
      const uploadParams = {
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read' as const, // Definindo como constante para melhor tipagem
      };

      await this.s3.send(new PutObjectCommand(uploadParams));

      const avatarUrl = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        { avatarUrl },
        { new: true, runValidators: true }
      ).select('-password');

      if (!updatedUser) {
        throw new NotFoundException('Usuário não encontrado');
      }

      return { avatarUrl };
    } catch (error) {
      if (error instanceof S3ServiceException) {
        console.error('Erro no S3:', error.$metadata);
        throw new Error(`Falha no upload: ${error.message}`);
      }
      throw error;
    }
  }
}



