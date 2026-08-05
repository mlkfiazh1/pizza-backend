import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../database/repositories/category.repository';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async find() {
    const category = await this.categoryRepository.find(
      {},
      { select: '_id name' },
    );

    return category;
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({ _id: id });

    if (!category) {
      throw new Error('Category not found');
    }

    return { _id: category._id, name: category.name };
  }
}
