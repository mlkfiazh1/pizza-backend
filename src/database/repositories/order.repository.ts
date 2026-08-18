import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model, PipelineStage, QueryFilter } from 'mongoose';
import { MODEL } from '../consts';
import { Order } from '../schemas/order.schema';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectModel(MODEL.ORDER)
    private readonly orderModel: Model<Order>,
  ) {}

  async create(payload: Partial<Order>) {
    const pizza = new this.orderModel(payload);
    return await pizza.save();
  }

  async findOne(filter: QueryFilter<Order>) {
    return this.orderModel.findOne(filter);
  }

  async save(order: HydratedDocument<Order>) {
    return (await order.save()).toJSON();
  }

  async aggregate(pipeline?: PipelineStage[]) {
    return await this.orderModel.aggregate(pipeline);
  }

  async aggregateWithPagination({
    page = 1,
    limit = 12,
    pipelines = [],
  }: {
    page?: number;
    limit?: number;
    pipelines?: PipelineStage[];
  }) {
    const [data] = await this.orderModel.aggregate([
      ...pipelines,
      {
        $facet: {
          total: [
            {
              $sortByCount: '$tag',
            },
          ],
          data: [
            {
              $addFields: {
                _id: '$_id',
              },
            },
          ],
        },
      },
      {
        $unwind: '$total',
      },
      {
        $project: {
          collections: {
            $slice: [
              '$data',
              (page - 1) * limit,
              {
                $ifNull: [limit, '$total.count'],
              },
            ],
          },
          total: '$total.count',
          page: {
            $ceil: { $literal: page - 1 / limit },
          },
          pages: {
            $ceil: {
              $divide: ['$total.count', limit],
            },
          },
        },
      },
    ]);

    return {
      data: data?.collections || [],
      meta: {
        page: data?.page || 1,
        pages: data?.pages || 0,
        limit: limit || 0,
        total: data?.total || 0,
      },
    };
  }
}
