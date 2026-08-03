import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema({})
export class Contact {
  @Prop({ type: SchemaTypes.ObjectId })
  _id?: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: Number, default: 1 })
  status?: number; // 0 = DELETE, 1 = ACTIVE, 2 = Inactive

  @Prop({ type: Date, default: Date.now() })
  created_at?: Date;

  @Prop({ type: Date, default: Date.now() })
  updated_at?: Date;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
