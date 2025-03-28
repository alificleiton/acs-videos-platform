import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UploadService } from './upload.service'; // Certifique-se de que o caminho está correto
import { VideosService } from './videos.service';
import { Video } from './schemas/video.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../config/upload.config';
import { Express } from 'express';
import { Query } from '@nestjs/common';

import { CreateVideoDto } from './create-video.dto';

@Controller('videos')
//@UseGuards(JwtAuthGuard)
export class VideosController {
  
  constructor(
    private readonly videosService: VideosService,
    private readonly uploadService: UploadService,  // Injetando o UploadService aqui
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file')) // 'file' é o nome do campo no formulário
  async create(
    @Body() videoData: CreateVideoDto,
    @UploadedFile() file: Express.Multer.File,  // 'file' é o arquivo enviado no corpo da requisição
  ): Promise<Video> {
    if (!file) {
      throw new Error('No file uploaded');
    }

    // Chama o serviço de upload de vídeo e obtém a URL do arquivo no S3
    const fileUrl = await this.uploadService.uploadFile(file); 

    // Agora cria o vídeo no MongoDB, incluindo a URL do arquivo no S3
    const newVideo = await this.videosService.create({
      ...videoData,  // Desestrutura os dados do vídeo (title, description)
      fileUrl,  // Adiciona a URL do arquivo do S3
    });

    return newVideo;
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
  async remove(@Param('id') id: string) {
    return this.videosService.remove(id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    const url = await this.uploadService.uploadFile(file);
    return { url };
  }

  @Get('paginated')
  async findPaginated(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.videosService.findPaginated(Number(page), Number(limit));
  }

  
}


