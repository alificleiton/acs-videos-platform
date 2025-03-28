import { Injectable ,Body, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Video, VideoDocument } from './schemas/video.schema';
import { CreateVideoDto } from './create-video.dto';

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

  async remove(id: string) {
    return this.videoModel.findByIdAndDelete(id).exec();
  }

  async findPaginated(page: number = 1, limit: number = 10) {
    return this.videoModel
      .find()
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  }

  
}
