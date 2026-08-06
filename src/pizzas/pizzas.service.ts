import { Injectable } from '@nestjs/common';
import { AddPizzaDto } from './pizzas.dto';
import { PizzaRepository } from '../database/repositories/pizza.repository';
import { MediaService } from '../common/services/media.service';
import { Types } from 'mongoose';

@Injectable()
export class PizzasService {
  constructor(
    private readonly pizzaRepository: PizzaRepository,
    private readonly mediaService: MediaService,
  ) {}

  async create(payload: AddPizzaDto, file: Express.Multer.File) {
    const filePath = await this.mediaService.uploadFile(file);

    const pizza = await this.pizzaRepository.create({
      _id: new Types.ObjectId(),
      ...payload,
      image: filePath,
    });

    return pizza;
  }

  // findAll() {
  //   return `This action returns all pizzas`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} pizza`;
  // }

  // update(id: number, updatePizzaDto: UpdatePizzaDto) {
  //   return `This action updates a #${id} pizza`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} pizza`;
  // }
}
