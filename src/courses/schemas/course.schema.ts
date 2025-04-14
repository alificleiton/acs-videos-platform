import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Course extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  categoryId: Types.ObjectId;

  @Prop([{ type: Types.ObjectId, ref: 'Module' }])
  modules: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  professorId: Types.ObjectId;
}

export const CourseSchema = SchemaFactory.createForClass(Course);