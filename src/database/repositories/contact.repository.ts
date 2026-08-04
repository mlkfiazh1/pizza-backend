import { Model, QueryFilter, QueryOptions } from 'mongoose';
import { Category } from '../schemas/category.schema';
import { MODEL } from '../consts';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Contact } from '../schemas/contact.schema';

@Injectable()
export class ContactRepository {
  constructor(
    @InjectModel(MODEL.CONTACT)
    private readonly contactModel: Model<Contact>,
  ) {}

  async create(document: Partial<Contact>) {
    const contact = new this.contactModel(document);
    return (await contact.save()).toJSON();
  }
}
