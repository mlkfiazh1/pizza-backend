import { Module } from '@nestjs/common';
import { MongooseConfig } from './config';
import { MongooseModule } from '@nestjs/mongoose';
import { Models } from './database.provider';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongooseConfig,
    }),
    MongooseModule.forFeature(Models),
  ],
})
export class DatabaseModule {}
