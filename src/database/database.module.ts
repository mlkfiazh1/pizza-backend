import { Module } from '@nestjs/common';
import { MongooseConfig } from './config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongooseConfig,
    }),
  ],
})
export class DatabaseModule {}
