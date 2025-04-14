import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { Lesson, LessonSchema } from './schemas/lesson.schema';
import { AuthModule } from '../auth/auth.module'; // IMPORTANTE

@Module({
  imports: [MongooseModule.forFeature([{ name: Lesson.name, schema: LessonSchema }]),
  AuthModule,
],
  controllers: [LessonsController],
  providers: [LessonsService],
})
export class LessonsModule {}
