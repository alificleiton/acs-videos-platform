import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course, CourseSchema } from './schemas/course.schema';
import { AuthModule } from '../auth/auth.module'; // IMPORTANTE

@Module({
  imports: [MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }]),
  AuthModule,
],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
