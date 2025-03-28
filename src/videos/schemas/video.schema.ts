import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VideoDocument = Video & Document;

@Schema({ timestamps: true })
export class Video {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  fileUrl: string;  // Novo campo para armazenar a URL do arquivo no S3
}

export const VideoSchema = SchemaFactory.createForClass(Video);