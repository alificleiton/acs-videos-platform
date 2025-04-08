import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true }) // Ativa os campos createdAt e updatedAt automaticamente
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ 
    required: true,
    enum: ['admin', 'professor', 'aluno'],
    default: 'aluno'
  })
  role: string;

  @Prop({ default: '' }) // avatarUrl como string vazia
  avatarUrl: string;

  _id: any;

  createdAt?: Date; // Opcionalmente adicione no TS para autocomplete
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);