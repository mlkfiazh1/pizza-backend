import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { MODEL } from '../consts';

@Schema({})
export class PizzaSize {
  @Prop({ type: SchemaTypes.ObjectId })
  _id: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: MODEL.PIZZA, required: true })
  pizza: Types.ObjectId | string;

  @Prop({ type: SchemaTypes.ObjectId, ref: MODEL.SIZE, required: true })
  size: Types.ObjectId | string;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number, default: 1 })
  status?: number; // 0 - deleted | 1 - active | 2 - inactive | 3 - unverified

  @Prop({ type: Date, default: Date.now })
  create_at?: Date;

  @Prop({ type: Date, default: Date.now })
  updated_at?: Date;
}

export const PizzaSizeSchema = SchemaFactory.createForClass(PizzaSize);
