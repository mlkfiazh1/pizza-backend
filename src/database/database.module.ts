import { Module } from '@nestjs/common';
import { MongooseConfig } from './config';
import { MongooseModule } from '@nestjs/mongoose';
import { Models } from './database.provider';
import { CategoryRepository } from './repositories/category.repository';
import { SizeRepository } from './repositories/size.repository';
import { UserRepository } from './repositories/user.repository';
import { ContactRepository } from './repositories/contact.repository';
import { PizzaRepository } from './repositories/pizza.repository';
import { PizzaSizeRepository } from './repositories/pizza-size.repository';
import { OrderRepository } from './repositories/order.repository';
import { OrderDetailRepository } from './repositories/order-details.repository';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongooseConfig,
    }),
    MongooseModule.forFeature(Models),
  ],
  providers: [
    UserRepository,
    SizeRepository,
    CategoryRepository,
    ContactRepository,
    PizzaRepository,
    PizzaSizeRepository,
    OrderRepository,
    OrderDetailRepository,
  ],
  exports: [
    UserRepository,
    SizeRepository,
    CategoryRepository,
    ContactRepository,
    PizzaRepository,
    PizzaSizeRepository,
    OrderRepository,
    OrderDetailRepository,
  ],
})
export class DatabaseModule {}
