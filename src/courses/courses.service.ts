import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';

import { S3Client, PutObjectCommand, S3ServiceException } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

@Injectable()
export class CoursesService {
  private s3: S3Client;
  private bucketName = process.env.AWS_BUCKET_NAME;

  constructor(
    @InjectModel(Course.name) private courseModel: Model<Course>,
  ) {
    if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !this.bucketName) {
      throw new Error('Missing AWS environment variables');
    }

    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async create(dto: CreateCourseDto) {
    return this.courseModel.create(dto);
  }

  async findAll() {
    return this.courseModel.find().populate(['categoryId', 'modules', 'professorId']);
  }

  async uploadThumbnail(courseId: string, file: Express.Multer.File): Promise<{ thumbnailUrl: string }> {
    if (!file || !file.buffer) {
      throw new Error('Arquivo inválido');
    }

    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    const fileExtension = path.extname(file.originalname);
    const fileKey = `courses/thumbnails/${uuidv4()}${fileExtension}`;

    try {
      const uploadParams = {
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read' as const,
      };

      await this.s3.send(new PutObjectCommand(uploadParams));

      const thumbnailUrl = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

      course.thumbnailUrl = thumbnailUrl;
      await course.save();

      return { thumbnailUrl };
    } catch (error) {
      if (error instanceof S3ServiceException) {
        console.error('Erro no S3:', error.$metadata);
        throw new Error(`Falha no upload: ${error.message}`);
      }
      throw error;
    }
  }


  async createCourseWithThumbnail(dto: CreateCourseDto, file: Express.Multer.File) {
    if (!file || !file.buffer) {
      throw new Error('Arquivo de imagem inválido');
    }
  
    const fileExtension = file.originalname.split('.').pop();
    const fileKey = `courses/thumbnails/${uuidv4()}.${fileExtension}`;
  
    const uploadParams = {
      Bucket: this.bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read' as const,
    };
  
    await this.s3.send(new PutObjectCommand(uploadParams));
  
    const thumbnailUrl = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
  
    const course = new this.courseModel({
      ...dto,
      thumbnailUrl,
    });
  
    await course.save();
  
    return course;
  }
}