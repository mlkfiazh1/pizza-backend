import { Model, QueryFilter, QueryOptions } from 'mongoose';
import { Size } from '../schemas/size.schema';
import { MODEL } from '../consts';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SizeRepository {
  constructor(
    @InjectModel(MODEL.SIZE) private readonly sizeModel: Model<Size>,
  ) {}

  async find(filter: QueryFilter<Size>, options: QueryOptions<Document>) {
    return this.sizeModel.find(filter, {}, options);
  }
}
