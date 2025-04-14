import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './schemas/category.schema';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    return this.categoryModel.create(dto);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException('Categoria não encontrada');
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const updated = await this.categoryModel.findByIdAndUpdate(id, dto, { new: true });
    if (!updated) throw new NotFoundException('Categoria não encontrada');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.categoryModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Categoria não encontrada');
  }
}