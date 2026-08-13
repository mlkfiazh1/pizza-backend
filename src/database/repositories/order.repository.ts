import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model, QueryFilter } from 'mongoose';
import { MODEL } from '../consts';
import { Order } from '../schemas/order.schema';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectModel(MODEL.ORDER)
    private readonly orderModel: Model<Order>,
  ) {}

  async create(payload: Partial<Order>) {
    const pizza = new this.orderModel(payload);
    return await pizza.save();
  }

  async findOne(filter: QueryFilter<Order>) {
    return this.orderModel.findOne(filter);
  }

  async save(order: HydratedDocument<Order>) {
    return (await order.save()).toJSON();
  }
}
