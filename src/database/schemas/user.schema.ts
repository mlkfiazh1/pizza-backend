import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema({})
export class User {
  @Prop({ type: SchemaTypes.ObjectId })
  _id?: Types.ObjectId;

  @Prop({ type: String, allowNull: false })
  name: string;

  @Prop({ type: String, allowNull: false })
  email: string;

  @Prop({ type: String, allowNull: false })
  password: string;

  @Prop({ type: Number, default: 2 })
  role?: number; // 1 = ADMIN, 2 = CUSTOMER

  @Prop({ type: Number, allowNull: true })
  otp_code?: number;

  @Prop({ type: Number, default: 1 })
  status?: number; // 0 = DELETE, 1 = ACTIVE, 2 = Inactive

  @Prop({ type: Date, default: Date.now() })
  created_at?: Date;

  @Prop({ type: Date, default: Date.now() })
  updated_at?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
