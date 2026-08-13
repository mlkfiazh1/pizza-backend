import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../database/repositories/order.repository';
import { OrderDto, UserDto } from './order.dto';
import { Types } from 'mongoose';
import { PizzaSizeRepository } from '../database/repositories/pizza-size.repository';
import { OrderDetailRepository } from '../database/repositories/order-details.repository';

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
}
