import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  UseGuards,
  Delete,
  Put,
  UploadedFiles,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Post(':id/thumbnail')
  @UseInterceptors(FileInterceptor('file'))
  uploadThumbnail(
    @Param('id') courseId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.coursesService.uploadThumbnail(courseId, file);
  }

  @Post('with-thumbnail')
  @UseInterceptors(FileInterceptor('thumbnail'))
  createWithThumbnail(
    @Body() dto: CreateCourseDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.coursesService.createCourseWithThumbnail(dto, file);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('thumbnail')) // <- 'thumbnail' é o nome do campo no FormData
  updateCourse(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @UploadedFile() thumbnail: Express.Multer.File
  ) {
    return this.coursesService.updateCourse(id, dto, thumbnail);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteCourse(@Param('id') id: string) {
    return this.coursesService.deleteCourse(id);
  }
}