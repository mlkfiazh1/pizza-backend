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
}
