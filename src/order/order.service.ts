import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../database/repositories/order.repository';
import { OrderDto, UserDto } from './order.dto';
import { Types } from 'mongoose';
import { PizzaSizeRepository } from '../database/repositories/pizza-size.repository';
import { OrderDetailRepository } from '../database/repositories/order-details.repository';
import { EnumRole, EnumStatus } from '../common/enum';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly pizzaSizeRepository: PizzaSizeRepository,
    private readonly orderDetailRepository: OrderDetailRepository,
  ) {}

  async create(user: UserDto, payload: OrderDto) {
    const OrderResponse = await this.orderRepository.create({
      _id: new Types.ObjectId(),
      user: user._id,
    });

    const data = await Promise.all(
      payload.orders.map(async (order) => {
        const pizzaSize = await this.pizzaSizeRepository.findOne({
          _id: new Types.ObjectId(order.size),
        });

        const price = pizzaSize?.price || 0;

        return {
          _id: new Types.ObjectId(),
          order: OrderResponse._id,
          pizza: order.pizza,
          size: order.size,
          quantity: order.quantity,
          price: price,
          total: order.quantity * price,
        };
      }),
    );

    await this.orderDetailRepository.createMany(data);

    return;
  }

  async findAll(user: UserDto) {
    let filter = {
      status: EnumStatus.ACTIVE,
    };

    if (user.role === EnumRole.USER) {
      filter['user'] = new Types.ObjectId(user._id);
    }

    const response = await this.orderRepository.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: 'order_detail',
          localField: '_id',
          foreignField: 'order',
          as: 'order_details',
          pipeline: [
            {
              $lookup: {
                from: 'pizza',
                localField: 'pizza',
                foreignField: '_id',
                as: 'pizza',
              },
            },
            {
              $unwind: '$pizza',
            },
            {
              $project: {
                _id: 1,
                size: 1,
                quantity: 1,
                price: 1,
                total: 1,
                pizza: {
                  _id: 1,
                  name: 1,
                  image: 1,
                },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'user',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          _id: 1,
          order_details: 1,
          user: {
            _id: 1,
            name: 1,
          },
        },
      },
    ]);

    return response;
  }
}
