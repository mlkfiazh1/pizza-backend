import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { ContactModule } from './contact/contact.module';
import { SizeModule } from './size/size.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './common/guard';
import { ExceptionsFilter } from './common/filter';
import { TransformInterceptor } from './common/interceptor';
import { PizzasModule } from './pizzas/pizzas.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PizzaSizeModule } from './pizza-size/pizza-size.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public/',
    }),
    DatabaseModule,
    ContactModule,
    AuthModule,
    CategoryModule,
    SizeModule,
    PizzasModule,
    PizzaSizeModule,
    OrderModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_FILTER, useClass: ExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
