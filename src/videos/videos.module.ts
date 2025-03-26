import { Module } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from './schemas/video.schema';
import { AuthModule } from '../auth/auth.module'; // 🔥 Importando o módulo de autenticação

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
    AuthModule, // 📢 Agora temos acesso ao JwtService
  ],
  controllers: [VideosController],
  providers: [VideosService],
})
export class VideosModule {}
