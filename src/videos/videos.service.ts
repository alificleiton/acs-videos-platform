import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Video, VideoDocument } from './schemas/video.schema';

@Injectable()
export class VideosService {
  constructor(@InjectModel(Video.name) private videoModel: Model<VideoDocument>) {}

  async create(videoData: Partial<Video>): Promise<Video> {
    const video = new this.videoModel(videoData);
    return video.save();
  }

  async findAll(): Promise<Video[]> {
    return this.videoModel.find().exec();
  }

  async findOne(id: string): Promise<Video | null> { // ✅ Corrigido
    return this.videoModel.findById(id).exec();
  }

  async update(id: string, updateData: Partial<Video>): Promise<Video | null> { // ✅ Corrigido
    return this.videoModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async delete(id: string): Promise<Video | null> { // ✅ Corrigido
    return this.videoModel.findByIdAndDelete(id).exec();
  }
}