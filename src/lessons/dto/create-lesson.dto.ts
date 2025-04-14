import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLessonDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  videoUrl: string;

  @IsNotEmpty()
  moduleId: string;
}