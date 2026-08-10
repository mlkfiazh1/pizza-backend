import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model, PipelineStage, QueryFilter } from 'mongoose';
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

  async aggregate(pipeline?: PipelineStage[]) {
    return await this.pizzaModel.aggregate(pipeline);
  }

  async findOne(filter: QueryFilter<Pizza>) {
    return this.pizzaModel.findOne(filter);
  }

  async save(pizza: HydratedDocument<Pizza>) {
    return (await pizza.save()).toJSON();
  }
}
