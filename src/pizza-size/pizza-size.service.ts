import { BadRequestException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { PizzaSizeRepository } from '../database/repositories/pizza-size.repository';
import { AddPizzaSizeDto, UpdatePizzaSizeDto } from './pizza-size.dto';
import { EnumStatus } from '../common/enum';

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

  async findAll(pizza_id: string) {
    const pizzaSizes = await this.pizzaSizeRepository.aggregate([
      {
        $match: {
          pizza: new Types.ObjectId(pizza_id),
          status: EnumStatus.ACTIVE,
        },
      },
      {
        $lookup: {
          from: 'size',
          localField: 'size',
          foreignField: '_id',
          as: 'size',
        },
      },
      {
        $unwind: '$size',
      },
      {
        $project: {
          _id: 1,
          price: 1,
          size: {
            _id: 1,
            name: 1,
            symbol: 1,
          },
        },
      },
    ]);

    return pizzaSizes;
  }

  async update(_id: string, payload: UpdatePizzaSizeDto) {
    const pizza = await this.pizzaSizeRepository.findOne({
      _id: new Types.ObjectId(_id),
      status: EnumStatus.ACTIVE,
    });

    if (!pizza) {
      throw new BadRequestException('Pizza size not found');
    }

    payload.pizza && (pizza.pizza = new Types.ObjectId(payload.pizza));
    payload.size && (pizza.size = new Types.ObjectId(payload.size));
    payload.pizza && (pizza.pizza = payload.pizza);

    await this.pizzaSizeRepository.save(pizza);

    return;
  }
}
