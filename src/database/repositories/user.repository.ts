import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { MODEL } from '../consts';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(MODEL.USER) private readonly userModel: Model<User>,
  ) {}
}
