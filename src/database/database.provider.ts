import { MODEL } from './consts';
import { CategorySchema } from './schemas/category.schema';
import { ContactSchema } from './schemas/contact.schema';
import { OrderDetailSchema } from './schemas/order-details.schema';
import { OrderSchema } from './schemas/order.schema';
import { PizzaSizeSchema } from './schemas/pizza-size.schema';
import { PizzaSchema } from './schemas/pizza.schema';
import { SizeSchema } from './schemas/size.schema';
import { UserSchema } from './schemas/user.schema';

export const Models = [
  {
    name: MODEL.USER,
    schema: UserSchema,
    collection: MODEL.USER,
  },
  {
    name: MODEL.CATEGORY,
    schema: CategorySchema,
    collection: MODEL.CATEGORY,
  },
  {
    name: MODEL.SIZE,
    schema: SizeSchema,
    collection: MODEL.SIZE,
  },
  {
    name: MODEL.CONTACT,
    schema: ContactSchema,
    collection: MODEL.CONTACT,
  },
  {
    name: MODEL.PIZZA,
    schema: PizzaSchema,
    collection: MODEL.PIZZA,
  },
  {
    name: MODEL.PIZZA_SIZE,
    schema: PizzaSizeSchema,
    collection: MODEL.PIZZA_SIZE,
  },
  {
    name: MODEL.ORDER,
    schema: OrderSchema,
    collection: MODEL.ORDER,
  },
  {
    name: MODEL.ORDER_DETAIL,
    schema: OrderDetailSchema,
    collection: MODEL.ORDER_DETAIL,
  },
];
