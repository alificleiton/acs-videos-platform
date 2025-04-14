import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Module {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Course' })
  course: Types.ObjectId;
}

export type ModuleDocument = Module & Document;
export const ModuleSchema = SchemaFactory.createForClass(Module);