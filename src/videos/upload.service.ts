import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

// Carregar as variáveis de ambiente do .env
dotenv.config();

@Injectable()
export class UploadService {
  private s3: S3Client;
  //private bucketName: string = process.env.AWS_BUCKET_NAME;
  private bucketName = process.env.AWS_BUCKET_NAME;

  constructor() {
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

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileKey = `${uuidv4()}-${file.originalname}`;

    const uploadParams = {
      Bucket: this.bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      // Enviar o arquivo para o S3
      await this.s3.send(new PutObjectCommand(uploadParams));

      // Retornar a URL pública do arquivo
      return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file to S3');
    }
  }
}

