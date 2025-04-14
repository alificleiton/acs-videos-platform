import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Lesson extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  videoUrl: string;

  @Prop({ type: Types.ObjectId, ref: 'Module' })
  moduleId: Types.ObjectId;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);