import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { ContactRepository } from '../database/repositories/contact.repository';
import { ContactDto } from './contact.dto';

@Injectable()
export class ContactService {
  constructor(private readonly contactRepository: ContactRepository) {}

  async save(payload: ContactDto) {
    await this.contactRepository.create({
      _id: new Types.ObjectId(),
      ...payload,
    });

    return;
  }
}
