import { Types } from 'mongoose';

export interface ISigntoken {
  _id: string | Types.ObjectId;
  role: number;
}
