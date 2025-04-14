import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Module, ModuleDocument } from './schemas/module.schema';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

@Injectable()
export class ModulesService {
  constructor(
    @InjectModel(Module.name) private moduleModel: Model<ModuleDocument>,
  ) {}

  create(dto: CreateModuleDto) {
    return this.moduleModel.create(dto);
  }

  findAll() {
    return this.moduleModel.find().populate('course').exec();
  }

  findOne(id: string) {
    return this.moduleModel.findById(id).populate('course').exec();
  }

  update(id: string, dto: UpdateModuleDto) {
    return this.moduleModel.findByIdAndUpdate(id, dto, { new: true });
  }

  remove(id: string) {
    return this.moduleModel.findByIdAndDelete(id);
  }
}

