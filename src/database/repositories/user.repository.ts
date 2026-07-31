import { Model, QueryFilter } from 'mongoose';
import { User } from '../schemas/user.schema';
import { MODEL } from '../consts';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(MODEL.USER) private readonly userModel: Model<User>,
  ) {}

  async findOne(filter: QueryFilter<User>) {
    return this.userModel.findOne(filter);
  }

  async create(document: Partial<User>) {
    const user = new this.userModel(document);
    console.log(user, document);
    return (await user.save()).toJSON();
  }
}
