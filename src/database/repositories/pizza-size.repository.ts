import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  HydratedDocument,
  Model,
  PipelineStage,
  QueryFilter,
  QueryOptions,
} from 'mongoose';
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

  async findOne(filter: QueryFilter<PizzaSize>) {
    return this.pizzaSizeModel.findOne(filter);
  }

  async save(pizza: HydratedDocument<PizzaSize>) {
    return (await pizza.save()).toJSON();
  }

  async aggregate(pipeline?: PipelineStage[]) {
    return await this.pizzaSizeModel.aggregate(pipeline);
  }
}
