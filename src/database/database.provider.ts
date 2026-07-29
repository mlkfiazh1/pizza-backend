import { MODEL } from './consts';
import { UserSchema } from './schemas/user.schema';

export const Models = [
  {
    name: MODEL.USER,
    schema: UserSchema,
    collection: MODEL.USER,
  },
];
