import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lesson } from './schemas/lesson.schema';
import { CreateLessonDto } from './dto/create-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(@InjectModel(Lesson.name) private lessonModel: Model<Lesson>) {}

  create(dto: CreateLessonDto) {
    return this.lessonModel.create(dto);
  }

  findAll() {
    return this.lessonModel.find().populate('moduleId');
  }
}
