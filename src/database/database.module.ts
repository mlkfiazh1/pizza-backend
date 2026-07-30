import { Module } from '@nestjs/common';
import { MongooseConfig } from './config';
import { MongooseModule } from '@nestjs/mongoose';
import { Models } from './database.provider';
import { CategoryRepository } from './repositories/category.repository';
import { SizeRepository } from './repositories/size.repository';
import { UserRepository } from './repositories/user.repository';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongooseConfig,
    }),
    MongooseModule.forFeature(Models),
  ],
  providers: [UserRepository, SizeRepository, CategoryRepository],
  exports: [UserRepository, SizeRepository, CategoryRepository],
})
export class DatabaseModule {}
