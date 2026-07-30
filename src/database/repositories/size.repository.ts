import { Model } from 'mongoose';
import { Size } from '../schemas/size.schema';
import { MODEL } from '../consts';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SizeRepository {
  constructor(
    @InjectModel(MODEL.SIZE) private readonly sizeModel: Model<Size>,
  ) {}
}
