import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MODEL } from '../consts';
import { OrderDetail } from '../schemas/order-details.schema';

@Injectable()
export class OrderDetailRepository {
  constructor(
    @InjectModel(MODEL.ORDER_DETAIL)
    private readonly orderDetailModel: Model<OrderDetail>,
  ) {}

  async create(payload: Partial<OrderDetail>) {
    const pizza = new this.orderDetailModel(payload);
    return await pizza.save();
  }

  async createMany(documents: OrderDetail[]) {
    const insertedDocuments = await this.orderDetailModel.insertMany(documents);
    return insertedDocuments;
  }
}
