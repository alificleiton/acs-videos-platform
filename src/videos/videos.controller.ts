import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { VideosService } from './videos.service';
import { Video } from './schemas/video.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../config/upload.config';
import { Express } from 'express';

@Controller('videos')
//@UseGuards(JwtAuthGuard)
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post()
  async create(@Body() videoData: Partial<Video>): Promise<Video> {
    return this.videosService.create(videoData);
  }

  @Get()
  async findAll(): Promise<Video[]> {
    return this.videosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Video | null> { // ✅ Corrigido
    return this.videosService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateData: Partial<Video>): Promise<Video | null> { // ✅ Corrigido
    return this.videosService.update(id, updateData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<Video | null> { // ✅ Corrigido
    return this.videosService.delete(id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    return { message: 'Vídeo enviado com sucesso!', file };
  }
}


