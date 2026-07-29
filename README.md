# Database & Auth Layer

This document explains the NestJS + Mongoose data layer and how the **Auth** feature uses it:

**config → module → schema → provider → repository → auth (dto → interface → service → controller → module)**

```
.env (MONGODB_*, TOKEN_*, ACCESS_TOKEN_*)
        │
        ▼
   config/          → connection options (URI, db name)
        │
        ▼
 database.module    → wires ConfigModule + Mongoose + Models + Repositories
        │
   ┌────┴────┐
   ▼         ▼
 schema/   model.provider  → document shape + registers models on collections
   │         │
   └────┬────┘
        ▼
 repositories/      → data-access API (UserRepository)
        │
        ▼
 AuthModule         → feature that consumes UserRepository
   │
   ├── auth.dto         → request shapes (SigninDto, SignupDto)
   ├── auth.interface   → token-payload types
   ├── auth.service     → signup / signin / JWT + encrypt
   ├── auth.controller  → HTTP routes under /auth
   └── auth.module      → imports DatabaseModule, wires controller + service
```

`AppModule` imports `ConfigModule`, `DatabaseModule`, and `AuthModule` so the full stack boots together.

---

## 1. Config (`config/index.ts`)

**Role:** Tell Mongoose *where* and *how* to connect.

```ts
export class MongooseConfig implements MongooseOptionsFactory {
  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: process.env.MONGODB_URL,
      dbName: process.env.MONGODB_DATABASE_NAME,
    };
  }
}
```

| Piece | Meaning |
| --- | --- |
| `MongooseOptionsFactory` | Nest contract: implement `createMongooseOptions()` so options can be built asynchronously / from env. |
| `uri` | MongoDB connection string (`MONGODB_URL` in `.env`). |
| `dbName` | Target database name (`MONGODB_DATABASE_NAME` in `.env`). |

Used by `MongooseModule.forRootAsync({ useClass: MongooseConfig })` so connection settings stay out of the module file and can grow later (timeouts, retries, auth) without touching feature code.

---

## 2. Module (`database.module.ts`)

**Role:** Nest DI entry point that connects MongoDB, registers models, and exports repositories.

```ts
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      useClass: MongooseConfig,
    }),
    MongooseModule.forFeature(Models),
  ],
  providers: [UserRepository],
  exports: [UserRepository],
})
export class DatabaseModule {}
```

| Chunk | What it does |
| --- | --- |
| `ConfigModule.forRoot()` | Loads `.env` so `process.env.MONGODB_*` is available to `MongooseConfig`. |
| `MongooseModule.forRootAsync(...)` | Opens the global MongoDB connection using `MongooseConfig`. |
| `MongooseModule.forFeature(Models)` | Registers each schema/model (from the provider) for injection via `@InjectModel`. |
| `providers: [UserRepository]` | Makes repositories available inside this module. |
| `exports: [UserRepository]` | Lets other modules (`AuthModule`, `AppModule`) inject repositories without re-registering Mongoose. |

`DatabaseModule` is imported in `AppModule` and feature modules that need DB access (e.g. `AuthModule`).

---

## 3. Schema (`schemas/`)

**Role:** Define the document shape (fields, types, defaults) for a MongoDB collection.

### `schemas/user.schema.ts`

```ts
@Schema({ versionKey: false })
export class User {
  @Prop({ type: SchemaTypes.ObjectId })
  _id: Types.ObjectId;

  @Prop({ type: String, allowNull: false })
  name!: string;
  // ... email, password, attempts, role, otp_code, status, timestamps
}

export const UserSchema = SchemaFactory.createForClass(User);
```

| Piece | Meaning |
| --- | --- |
| `@Schema({ versionKey: false })` | Disables Mongoose’s `__v` version key on documents. |
| `@Prop(...)` | Declares each field’s type and defaults. |
| `SchemaFactory.createForClass(User)` | Builds the Mongoose schema object Nest registers with `forFeature`. |
| `schemas/index.ts` | Barrel export so consumers import from `./schemas`. |

### User fields (current)

| Field | Notes |
| --- | --- |
| `_id` | MongoDB ObjectId |
| `name`, `email`, `password` | Required identity / auth fields |
| `attempts` | Login attempt counter (default `0`) |
| `role` | `1` admin, `2` customer (default `2`) |
| `otp_code` | Optional OTP |
| `status` | `0` deleted, `1` active, `2` inactive, `3` unverified (default `1`) |
| `create_at`, `updated_at` | Timestamps (default `Date.now`) |

Schemas describe *structure*. They do not run queries; repositories do.

---

## 4. Provider (`model.provider.ts` + `constants/`)

**Role:** Map schema classes to Mongoose model names and collection names for `MongooseModule.forFeature`.

### Constants (`constants/index.ts`)

```ts
export const MODEL = {
  USER: 'user',
};
```

Central string tokens for model/collection names. Used by the provider, `@InjectModel(MODEL.USER)`, and keeps renames in one place.

### Model provider (`model.provider.ts`)

```ts
export const Models = [
  {
    name: MODEL.USER,
    schema: UserSchema,
    collection: MODEL.USER,
  },
];
```

| Property | Meaning |
| --- | --- |
| `name` | Token Nest uses for `@InjectModel(name)`. |
| `schema` | The schema built from the class (`UserSchema`). |
| `collection` | MongoDB collection name (`user`). |

Add a new entity by: defining a schema → adding a `MODEL.*` constant → appending an entry to `Models` → creating a repository → registering/exporting it in `DatabaseModule`.

---

## 5. Repository (`repositories/`)

**Role:** Encapsulate database operations so services never talk to Mongoose models directly.

### `repositories/user.repository.ts`

```ts
@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(MODEL.USER) private readonly userModel: Model<User>,
  ) {}

  async findOne(filter: QueryFilter<User>) { ... }
  async create(document: Partial<User>) { ... }
  async save(user: HydratedDocument<User>) { ... }
}
```

| Piece | Meaning |
| --- | --- |
| `@InjectModel(MODEL.USER)` | Injects the model registered in `Models` / `forFeature`. |
| `findOne` | Lookup by filter (e.g. email). |
| `create` | Build a document, `save()`, return plain JSON. |
| `save` | Persist an already-hydrated document and return JSON. |
| `repositories/index.ts` | Barrel export for clean imports. |

Feature services (e.g. `AuthService`) inject `UserRepository` after importing `DatabaseModule`. Business logic stays in services; persistence stays in repositories.

---

## 6. Auth Module (`src/modules/auth/`)

**Role:** HTTP feature for sign-up and sign-in. It never talks to Mongoose directly — it injects `UserRepository` from `DatabaseModule`.

Nest feature-module pattern: declare **controllers** (HTTP) and **providers** (services) in `@Module()`, and **import** shared modules whose exports you need.

```
HTTP request
    │
    ▼
AuthController     → validates route + binds body to DTO
    │
    ▼
AuthService        → business rules (hash, compare, lockout, tokens)
    │
    ▼
UserRepository     → Mongo persistence (from DatabaseModule)
```

Shared enums used by auth live in `src/common/enums`:

| Enum / config | Values / meaning |
| --- | --- |
| `EnumStatus` | `0` deleted, `1` active, `2` inactive, `3` unverified |
| `EnumRole` | `0` guest, `1` admin, `2` user |
| `EnumConfig.ALLOWED_ATTEMPTS` | `10` — max failed logins before account is blocked |

---

### 6.1 DTO (`auth.dto.ts`)

**Role:** Describe the shape of incoming request bodies. Controllers type `@Body()` with these classes so the payload is known at compile time.

```ts
export class SigninDto {
  readonly email: string;
  readonly password: string;
}

export class SignupDto {
  readonly name: string;
  readonly email: string;
  readonly password: string;
}
```

| DTO | Used by | Fields |
| --- | --- | --- |
| `SigninDto` | `POST /auth/v1/sign-in` | `email`, `password` |
| `SignupDto` | `POST /auth/v1/sign-up` | `name`, `email`, `password` |

DTOs are transport contracts only. They do not hash passwords, query the DB, or issue tokens — that stays in the service.

---

### 6.2 Interface (`auth.interface.ts`)

**Role:** Type the internal payloads passed between private token helpers (not HTTP request/response shapes).

```ts
export interface ISigntoken {
  _id: string | Types.ObjectId;
  role: number;
  password: string;
}

export interface ICreateAccessToken {
  _id: string | Types.ObjectId;
  role: number;
  expiration_time: string;
  password: string;
}
```

| Interface | Meaning |
| --- | --- |
| `ISigntoken` | Input to `signTokens()` after a successful login (user id, role, password hash for JWT claims). |
| `ICreateAccessToken` | Input to `createAccessToken()` including `expiration_time` from env. |

DTO = what the client sends. Interface = what auth helpers pass internally when building tokens.

---

### 6.3 Service (`auth.service.ts`)

**Role:** All auth business logic. Marked `@Injectable()` so Nest can inject it into the controller and inject `UserRepository` into it.

```ts
@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async signup(payload: SignupDto) { ... }
  async signin(payload: SigninDto) { ... }

  private signTokens(payload: ISigntoken) { ... }
  private createAccessToken(payload: ICreateAccessToken): string { ... }
}
```

#### `signup`

1. `findOne({ email, status: ACTIVE })` — reject if user already exists.
2. `bcrypt.hash(password, 10)` — never store plain text.
3. `create({ _id, ...payload, password: hashed, attempts: 0, role: USER })`.
4. Re-throw `HttpException`s; wrap unexpected errors as `500`.

#### `signin`

1. `findOne({ email, status: ACTIVE })` — missing user → `Invalid credentials`.
2. Guard inactive → `Account blocked`; unverified → `Please verify your account`.
3. `bcrypt.compare` password:
   - mismatch + attempts over `ALLOWED_ATTEMPTS` → set status `INACTIVE`, save, throw blocked.
   - mismatch otherwise → increment `attempts`, save, throw invalid credentials.
4. On success: reset `attempts` to `0`, save.
5. Build public `user` object (`_id`, `name`, `email`, `role`).
6. `signTokens` → return `{ access_token, expiresAt, user }`.

#### Token helpers (private)

| Method | What it does |
| --- | --- |
| `signTokens` | Reads `ACCESS_TOKEN_EXPIRATION_TIME`, computes `expiresAt`, calls `createAccessToken`. |
| `createAccessToken` | `jwt.sign({ _id, role, password }, TOKEN_SECRET, { expiresIn })`, then encrypts the JWT with `Crypterjs(TOKEN_SECRET)`. |

Env used here (in addition to Mongo): `TOKEN_SECRET`, `ACCESS_TOKEN_EXPIRATION_TIME`.

---

### 6.4 Controller (`auth.controller.ts`)

**Role:** Map HTTP routes to service methods. Thin layer: bind body → call service → return a message wrapper.

```ts
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/v1/sign-in')
  async signin(@Body() payload: SigninDto) {
    const response = await this.authService.signin(payload);
    return { message: 'User signed in successfully', data: response };
  }

  @Post('/v1/sign-up')
  async signup(@Body() payload: SignupDto) {
    await this.authService.signup(payload);
    return { message: 'User created successfully' };
  }
}
```

| Piece | Meaning |
| --- | --- |
| `@Controller('auth')` | Base path `/auth`. |
| `@Post('/v1/sign-in')` | Full route `POST /auth/v1/sign-in`. |
| `@Post('/v1/sign-up')` | Full route `POST /auth/v1/sign-up`. |
| `@Body() payload: SigninDto \| SignupDto` | Nest binds JSON body to the DTO type. |
| Constructor injection | Nest resolves `AuthService` from the module’s `providers`. |

The controller does not touch the repository or hash passwords; it only orchestrates HTTP ↔ service.

---

### 6.5 Module (`auth.module.ts`)

**Role:** Nest feature module that wires auth pieces and pulls in DB access via `DatabaseModule`.

```ts
@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
```

| Chunk | What it does |
| --- | --- |
| `imports: [DatabaseModule]` | Makes exported `UserRepository` injectable inside this module (needed by `AuthService`). |
| `controllers: [AuthController]` | Registers HTTP routes under `/auth`. |
| `providers: [AuthService]` | Registers the service in Nest’s DI container for the controller. |

Imported by `AppModule` alongside `DatabaseModule` and global `ConfigModule`:

```ts
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
  ],
})
export class AppModule {}
```

---

## End-to-end flows

### A. Boot + find user by email (data layer)

1. App boots → `DatabaseModule` loads env via `ConfigModule`.
2. `MongooseConfig` supplies `uri` + `dbName` → Mongo connection opens.
3. `Models` registers `User` schema on the `user` collection.
4. `UserRepository` is constructed with `@InjectModel('user')`.
5. `AuthService` calls `userRepository.findOne({ email })`.
6. Repository runs `userModel.findOne(...)` and returns the result.

### B. Sign-up (`POST /auth/v1/sign-up`)

1. Client sends `{ name, email, password }` → `AuthController.signup` binds `SignupDto`.
2. `AuthService.signup` checks for an existing active user.
3. Password is hashed with bcrypt; `UserRepository.create` persists the document (`role: USER`, `attempts: 0`).
4. Controller returns `{ message: 'User created successfully' }`.

### C. Sign-in (`POST /auth/v1/sign-in`)

1. Client sends `{ email, password }` → `AuthController.signin` binds `SigninDto`.
2. `AuthService.signin` loads the active user, checks status, compares password (with attempt lockout).
3. On success: reset attempts, build JWT + encrypt with Crypterjs.
4. Controller returns `{ message, data: { access_token, expiresAt, user } }`.

---

## File map

```
src/
├── app.module.ts                 ← imports Config + Database + Auth
├── common/
│   └── enums/index.ts            ← EnumStatus, EnumRole, EnumConfig
├── database/
│   ├── DATABASE.md               ← this guide
│   ├── database.module.ts        ← Nest module wiring
│   ├── model.provider.ts         ← schema → model registration list
│   ├── config/
│   │   └── index.ts              ← Mongo connection options
│   ├── constants/
│   │   └── index.ts              ← MODEL name tokens
│   ├── schemas/
│   │   ├── index.ts
│   │   └── user.schema.ts        ← User document definition
│   └── repositories/
│       ├── index.ts
│       └── user.repository.ts    ← User data-access methods
└── modules/
    └── auth/
        ├── auth.module.ts        ← feature module (imports DatabaseModule)
        ├── auth.controller.ts    ← POST /auth/v1/sign-in|sign-up
        ├── auth.dto.ts           ← SigninDto, SignupDto
        ├── auth.interface.ts     ← ISigntoken, ICreateAccessToken
        └── auth.service.ts       ← signup, signin, token helpers
```
