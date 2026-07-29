import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';

export class MongooseConfig implements MongooseOptionsFactory {
  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: process.env.MONGODB_URL,
      dbName: process.env.MONGODB_DATABASE_NAME,
    };
  }
}
