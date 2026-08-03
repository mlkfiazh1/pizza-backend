import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MODEL } from '../consts';
import { Order } from '../schemas/order.schema';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectModel(MODEL.ORDER)
    private readonly orderModel: Model<Order>,
  ) {}
}
