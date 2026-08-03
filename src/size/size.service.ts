import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../database/repositories/category.repository';
import { SizeRepository } from '../database/repositories/size.repository';

@Injectable()
export class SizeService {
  constructor(private readonly sizeRepository: SizeRepository) {}

  async find() {
    const sizes = await this.sizeRepository.find({}, { select: '_id name' });

    return sizes;
  }
}
