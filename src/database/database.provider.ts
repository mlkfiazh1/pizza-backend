import { MODEL } from './consts';
import { CategorySchema } from './schemas/category.schema';
import { ContactSchema } from './schemas/contact.schema';
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
];
