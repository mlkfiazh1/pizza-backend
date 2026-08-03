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
}
