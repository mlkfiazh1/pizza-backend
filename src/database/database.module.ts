import { Module } from '@nestjs/common';
import { MongooseConfig } from './config';
import { MongooseModule } from '@nestjs/mongoose';
import { Models } from './database.provider';
import { CategoryRepository } from './repositories/category.repository';
import { SizeRepository } from './repositories/size.repository';
import { UserRepository } from './repositories/user.repository';
import { ContactRepository } from './repositories/contact.repository';

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
  ],
  exports: [
    UserRepository,
    SizeRepository,
    CategoryRepository,
    ContactRepository,
  ],
})
export class DatabaseModule {}
