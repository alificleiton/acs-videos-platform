import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateModuleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  course?: string;
}