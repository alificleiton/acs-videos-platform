import { IsNotEmpty, IsString, IsNumber, IsArray, IsOptional } from 'class-validator';

export class CreateCourseDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  categoryId: string;

  @IsArray()
  modules?: string[];

  @IsNotEmpty()
  professorId: string;
}
