// order { _id, user, status, created_at, updated_at }

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { MODEL } from '../consts';

@Schema({})
export class Order {
  @Prop({ type: SchemaTypes.ObjectId })
  _id: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: MODEL.USER, required: true })
  user: Types.ObjectId | string;

  @Prop({ type: Number, default: 1 })
  status?: number; // 0 - deleted | 1 - active | 2 - inactive

  @Prop({ type: Date, default: Date.now })
  create_at?: Date;

  @Prop({ type: Date, default: Date.now })
  updated_at?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
