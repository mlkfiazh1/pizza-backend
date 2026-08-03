// order_details { _id, order, pizza, size, quantity, price, total, status, created_at, updated_at }

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { MODEL } from '../consts';

@Schema({})
export class OrderDetail {
  @Prop({ type: SchemaTypes.ObjectId })
  _id: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: MODEL.ORDER, required: true })
  order: Types.ObjectId | string;

  @Prop({ type: SchemaTypes.ObjectId, ref: MODEL.PIZZA, required: true })
  pizza: Types.ObjectId | string;

  @Prop({ type: String, required: true })
  size: string;

  @Prop({ type: Number, required: true })
  quantity: number;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number, required: true })
  total: number;

  @Prop({ type: Number, default: 1 })
  status?: number; // 0 - deleted | 1 - active | 2 - inactive

  @Prop({ type: Date, default: Date.now })
  create_at?: Date;

  @Prop({ type: Date, default: Date.now })
  updated_at?: Date;
}

export const OrderDetailSchema = SchemaFactory.createForClass(OrderDetail);
