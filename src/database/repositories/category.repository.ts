import { Model } from 'mongoose';
import { Category } from '../schemas/category.schema';
import { MODEL } from '../consts';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectModel(MODEL.CATEGORY)
    private readonly categoryModel: Model<Category>,
  ) {}
}
