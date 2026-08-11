import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { PizzaSizeRepository } from '../database/repositories/pizza-size.repository';
import { AddPizzaSizeDto } from './pizza-size.dto';

@Injectable()
export class PizzaSizeService {
  constructor(private readonly pizzaSizeRepository: PizzaSizeRepository) {}

  async create(payload: AddPizzaSizeDto) {
    const pizza = await this.pizzaSizeRepository.create({
      _id: new Types.ObjectId(),
      ...payload,
    });

    return pizza;
  }
}
