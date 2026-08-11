import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MODEL } from '../consts';
import { PizzaSize } from '../schemas/pizza-size.schema';

@Injectable()
export class PizzaSizeRepository {
  constructor(
    @InjectModel(MODEL.PIZZA_SIZE)
    private readonly pizzaSizeModel: Model<PizzaSize>,
  ) {}

  async create(payload: Partial<PizzaSize>) {
    const pizza = new this.pizzaSizeModel(payload);
    return await pizza.save();
  }
}
