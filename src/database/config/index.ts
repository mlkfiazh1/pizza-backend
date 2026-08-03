import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import { setServers } from 'dns';

export class MongooseConfig implements MongooseOptionsFactory {
  createMongooseOptions(): MongooseModuleOptions {
    setServers(['8.8.8.8', '1.1.1.1']);
    return {
      uri: process.env.MONGODB_URL,
      dbName: process.env.MONGODB_DATABASE_NAME,
    };
  }
}
