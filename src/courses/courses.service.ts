import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';

@Injectable()
export class CoursesService {
  constructor(@InjectModel(Course.name) private courseModel: Model<Course>) {}

  create(dto: CreateCourseDto) {
    return this.courseModel.create(dto);
  }

  findAll() {
    return this.courseModel.find().populate(['categoryId', 'modules', 'professorId']);
  }
}