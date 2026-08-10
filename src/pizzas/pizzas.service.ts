import { BadRequestException, Injectable } from '@nestjs/common';
import { AddPizzaDto, UpdatePizzaDto } from './pizzas.dto';
import { PizzaRepository } from '../database/repositories/pizza.repository';
import { MediaService } from '../common/services/media.service';
import { Types } from 'mongoose';
import { EnumStatus } from '../common/enum';

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

  async findAll() {
    const pizzas = await this.pizzaRepository.aggregate([
      {
        $match: {
          status: EnumStatus.ACTIVE,
        },
      },
      {
        $lookup: {
          from: 'category',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: '$category',
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          category: {
            _id: 1,
            name: 1,
          },
        },
      },
    ]);

    return pizzas;
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} pizza`;
  // }

  async update(
    _id: string,
    payload: UpdatePizzaDto,
    file?: Express.Multer.File,
  ) {
    const pizza = await this.pizzaRepository.findOne({
      _id: new Types.ObjectId(_id),
      status: { $in: [EnumStatus.ACTIVE, EnumStatus.INACTIVE] },
    });

    if (!pizza) {
      throw new BadRequestException('Pizza not found');
    }

    if (file) {
      await this.mediaService.deleteFile(pizza.image);
      const filePath = await this.mediaService.uploadFile(file);
      pizza.image = filePath;
    }

    payload.name && (pizza.name = payload.name);
    payload.category && (pizza.category = new Types.ObjectId(payload.category));
    payload.description && (pizza.description = payload.description);

    await this.pizzaRepository.save(pizza);

    return;
  }

  async remove(_id: string) {
    const pizza = await this.pizzaRepository.findOne({
      _id: new Types.ObjectId(_id),
      status: { $in: [EnumStatus.ACTIVE, EnumStatus.INACTIVE] },
    });

    if (!pizza) {
      throw new BadRequestException('Pizza not found');
    }

    pizza.status = EnumStatus.DELETED;

    await this.pizzaRepository.save(pizza);

    // await this.mediaService.deleteFile(pizza.image);

    return;
  }
}
