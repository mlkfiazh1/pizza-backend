import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MODEL } from '../consts';
import { Pizza } from '../schemas/pizza.schema';

@Injectable()
export class PizzaRepository {
  constructor(
    @InjectModel(MODEL.PIZZA)
    private readonly pizzaModel: Model<Pizza>,
  ) {}

  async create(payload: Partial<Pizza>) {
    const pizza = new this.pizzaModel(payload);
    return await pizza.save();
  }
}
