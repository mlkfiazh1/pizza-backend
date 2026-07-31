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
   ├── auth.dto         → request shapes + class-validator rules (SigninDto, SignupDto)
   ├── auth.interface   → token-payload types
   ├── auth.service     → signup / signin / JWT + encrypt
   ├── auth.controller  → HTTP routes under /auth
   └── auth.module      → imports DatabaseModule, wires controller + service
```

`AppModule` imports `ConfigModule`, `DatabaseModule`, and `AuthModule` so the full stack boots together.

Before feature modules handle requests, `main.ts` configures **CORS** and a global **ValidationPipe** so every route gets the same cross-origin policy and DTO validation behavior.

---

## 0. Bootstrap (`main.ts`) — CORS & DTO validation

**Role:** App entry point. After `NestFactory.create`, it enables CORS, registers a global `ValidationPipe`, then listens on `PORT` (default `3000`).

```ts
app.enableCors({
  origin: true,
  credentials: true,
});

app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

### CORS (`enableCors`)

| Option              | Meaning                                                                                                                                         |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `origin: true`      | Reflect the request’s `Origin` header — browsers may call the API from any origin (useful in local/dev; tighten to an allowlist in production). |
| `credentials: true` | Allow cookies / `Authorization` headers on cross-origin requests (`Access-Control-Allow-Credentials`).                                          |

Without this, a frontend on another host/port would be blocked by the browser before the request reaches Nest.

### Global `ValidationPipe` (DTO validation)

Controllers type `@Body()` with DTO classes (e.g. `SigninDto`, `SignupDto`). Those classes use **`class-validator`** decorators (`@IsEmail()`, `@IsNotEmpty()`, …). The global pipe runs on every incoming payload **before** the handler:

1. Instantiates the DTO class from the raw JSON body.
2. Runs the decorator rules.
3. On failure → Nest returns `400 Bad Request` with validation errors (handler never runs).
4. On success → the controller receives a typed, validated object.

| Option                           | Meaning                                                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `transform: true`                | Convert the plain body object into a real DTO class instance (required for decorator-based validation to run reliably).   |
| `forbidNonWhitelisted: true`     | Reject requests that include properties **not** declared on the DTO (extra fields → error instead of being ignored).      |
| `enableImplicitConversion: true` | Coerce query/path/body primitives to the DTO property types (e.g. `"10"` → `number` when the field is typed as `number`). |

**How it ties to Auth DTOs:** `POST /auth/v1/sign-in` and `sign-up` bind `@Body()` to `SigninDto` / `SignupDto`. Invalid email, empty fields, or a weak password fail in the pipe; only valid payloads reach `AuthService`.

Requires `class-validator` and `class-transformer` (Nest’s validation stack).

---

## 1. Config (`config/index.ts`)

**Role:** Tell Mongoose _where_ and _how_ to connect.

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

| Piece                    | Meaning                                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| `MongooseOptionsFactory` | Nest contract: implement `createMongooseOptions()` so options can be built asynchronously / from env. |
| `uri`                    | MongoDB connection string (`MONGODB_URL` in `.env`).                                                  |
| `dbName`                 | Target database name (`MONGODB_DATABASE_NAME` in `.env`).                                             |

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

| Chunk                               | What it does                                                                                        |
| ----------------------------------- | --------------------------------------------------------------------------------------------------- |
| `ConfigModule.forRoot()`            | Loads `.env` so `process.env.MONGODB_*` is available to `MongooseConfig`.                           |
| `MongooseModule.forRootAsync(...)`  | Opens the global MongoDB connection using `MongooseConfig`.                                         |
| `MongooseModule.forFeature(Models)` | Registers each schema/model (from the provider) for injection via `@InjectModel`.                   |
| `providers: [UserRepository]`       | Makes repositories available inside this module.                                                    |
| `exports: [UserRepository]`         | Lets other modules (`AuthModule`, `AppModule`) inject repositories without re-registering Mongoose. |

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

| Piece                                | Meaning                                                             |
| ------------------------------------ | ------------------------------------------------------------------- |
| `@Schema({ versionKey: false })`     | Disables Mongoose’s `__v` version key on documents.                 |
| `@Prop(...)`                         | Declares each field’s type and defaults.                            |
| `SchemaFactory.createForClass(User)` | Builds the Mongoose schema object Nest registers with `forFeature`. |
| `schemas/index.ts`                   | Barrel export so consumers import from `./schemas`.                 |

### User fields (current)

| Field                       | Notes                                                               |
| --------------------------- | ------------------------------------------------------------------- |
| `_id`                       | MongoDB ObjectId                                                    |
| `name`, `email`, `password` | Required identity / auth fields                                     |
| `attempts`                  | Login attempt counter (default `0`)                                 |
| `role`                      | `1` admin, `2` customer (default `2`)                               |
| `otp_code`                  | Optional OTP                                                        |
| `status`                    | `0` deleted, `1` active, `2` inactive, `3` unverified (default `1`) |
| `create_at`, `updated_at`   | Timestamps (default `Date.now`)                                     |

Schemas describe _structure_. They do not run queries; repositories do.

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

| Property     | Meaning                                         |
| ------------ | ----------------------------------------------- |
| `name`       | Token Nest uses for `@InjectModel(name)`.       |
| `schema`     | The schema built from the class (`UserSchema`). |
| `collection` | MongoDB collection name (`user`).               |

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

  async findOne(filter: QueryFilter<User>) {
    return this.userModel.findOne(filter);
  }
  async create(document: Partial<User>) {
    const user = new this.userModel(document);
    return (await user.save()).toJSON();
  }
  async save(user: HydratedDocument<User>) {
    return (await user.save()).toJSON();
  }
}
```

| Piece                      | Meaning                                                  |
| -------------------------- | -------------------------------------------------------- |
| `@InjectModel(MODEL.USER)` | Injects the model registered in `Models` / `forFeature`. |
| `findOne`                  | Lookup by filter (e.g. email).                           |
| `create`                   | Build a document, `save()`, return plain JSON.           |
| `save`                     | Persist an already-hydrated document and return JSON.    |
| `repositories/index.ts`    | Barrel export for clean imports.                         |

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

| Enum / config                 | Values / meaning                                      |
| ----------------------------- | ----------------------------------------------------- |
| `EnumStatus`                  | `0` deleted, `1` active, `2` inactive, `3` unverified |
| `EnumRole`                    | `0` guest, `1` admin, `2` user                        |
| `EnumConfig.ALLOWED_ATTEMPTS` | `10` — max failed logins before account is blocked    |

---

### 6.1 DTO (`auth.dto.ts`)

**Role:** Describe and **validate** incoming request bodies. Controllers type `@Body()` with these classes; the global `ValidationPipe` in `main.ts` enforces the `class-validator` rules before the handler runs.

```ts
export class SigninDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsStrongPassword()
  readonly password: string;
}

export class SignupDto {
  @IsNotEmpty()
  readonly name: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsStrongPassword()
  readonly password: string;
}
```

| DTO         | Used by                 | Fields & rules                                                                       |
| ----------- | ----------------------- | ------------------------------------------------------------------------------------ |
| `SigninDto` | `POST /auth/v1/sign-in` | `email` (`@IsNotEmpty`, `@IsEmail`), `password` (`@IsNotEmpty`, `@IsStrongPassword`) |
| `SignupDto` | `POST /auth/v1/sign-up` | `name` (`@IsNotEmpty`), plus the same `email` / `password` rules as sign-in          |

| Decorator             | Meaning                                                              |
| --------------------- | -------------------------------------------------------------------- |
| `@IsNotEmpty()`       | Field must be present and non-empty.                                 |
| `@IsEmail()`          | Value must be a valid email format.                                  |
| `@IsStrongPassword()` | Password must meet strength rules (length, mixed character classes). |

DTOs are transport + validation contracts only. They do not hash passwords, query the DB, or issue tokens — that stays in the service. Without the global pipe in `main.ts`, these decorators would not run automatically.

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

| Interface            | Meaning                                                                                         |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| `ISigntoken`         | Input to `signTokens()` after a successful login (user id, role, password hash for JWT claims). |
| `ICreateAccessToken` | Input to `createAccessToken()` including `expiration_time` from env.                            |

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

| Method              | What it does                                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `signTokens`        | Reads `ACCESS_TOKEN_EXPIRATION_TIME`, computes `expiresAt`, calls `createAccessToken`.                                  |
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

| Piece                                     | Meaning                                                    |
| ----------------------------------------- | ---------------------------------------------------------- |
| `@Controller('auth')`                     | Base path `/auth`.                                         |
| `@Post('/v1/sign-in')`                    | Full route `POST /auth/v1/sign-in`.                        |
| `@Post('/v1/sign-up')`                    | Full route `POST /auth/v1/sign-up`.                        |
| `@Body() payload: SigninDto \| SignupDto` | Nest binds JSON body to the DTO type.                      |
| Constructor injection                     | Nest resolves `AuthService` from the module’s `providers`. |

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

| Chunk                           | What it does                                                                             |
| ------------------------------- | ---------------------------------------------------------------------------------------- |
| `imports: [DatabaseModule]`     | Makes exported `UserRepository` injectable inside this module (needed by `AuthService`). |
| `controllers: [AuthController]` | Registers HTTP routes under `/auth`.                                                     |
| `providers: [AuthService]`      | Registers the service in Nest’s DI container for the controller.                         |

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

1. Client sends `{ name, email, password }` → global `ValidationPipe` validates `SignupDto` (reject `400` if rules fail).
2. `AuthController.signup` receives the validated body → `AuthService.signup`.
3. Service checks for an existing active user; password is hashed with bcrypt; `UserRepository.create` persists (`role: USER`, `attempts: 0`).
4. Controller returns `{ message: 'User created successfully' }`.

### C. Sign-in (`POST /auth/v1/sign-in`)

1. Client sends `{ email, password }` → global `ValidationPipe` validates `SigninDto`.
2. `AuthController.signin` → `AuthService.signin` loads the active user, checks status, compares password (with attempt lockout).
3. On success: reset attempts, build JWT + encrypt with Crypterjs.
4. Controller returns `{ message, data: { access_token, expiresAt, user } }`.

---

## File map

```
src/
├── main.ts                       ← CORS + ValidationPipe + Swagger UI, listen
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
        ├── auth.controller.ts    ← @ApiTags('Auth') + POST /auth/v1/sign-in|sign-up
        ├── auth.dto.ts           ← SigninDto, SignupDto (+ @ApiProperty)
        ├── auth.interface.ts     ← ISigntoken, ICreateAccessToken
        └── auth.service.ts       ← signup, signin, token helpers
```

---

## Swagger / OpenAPI

**Role:** Interactive API docs (Swagger UI) generated from Nest decorators. Config lives in `main.ts`; controllers and DTOs supply the metadata Swagger reads.

Docs URL after boot: **`http://localhost:3000/docs`** (or your `PORT`).

### App config (`main.ts`)

```ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const options = new DocumentBuilder()
  .setTitle('Pizza API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, options);

SwaggerModule.setup('docs', app, document, {
  swaggerOptions: {
    defaultModelsExpandDepth: -1,
    docExpansion: 'none',
  },
});
```

| Piece                                        | Meaning                                                                                               |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `DocumentBuilder`                            | Fluent builder for the OpenAPI document metadata (title, version, auth schemes).                      |
| `.setTitle('Corify API')`                    | Title shown in Swagger UI.                                                                            |
| `.setVersion('1.0')`                         | API version string in the docs.                                                                       |
| `.addBearerAuth()`                           | Registers HTTP Bearer security so the UI can send `Authorization: Bearer <token>` (Authorize button). |
| `.build()`                                   | Produces the config object passed to `createDocument`.                                                |
| `SwaggerModule.createDocument(app, options)` | Scans controllers/DTOs and builds the full OpenAPI JSON.                                              |
| `SwaggerModule.setup('docs', …)`             | Serves Swagger UI at `docs`.                                                                          |
| `defaultModelsExpandDepth: -1`               | Hides the Models/Schemas section by default (cleaner UI).                                             |
| `docExpansion: 'none'`                       | All tag groups start collapsed; expand one at a time.                                                 |

### Controller tag (`@ApiTags`)

Groups endpoints under a named section in Swagger UI.

```ts
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController { ... }
```

| Piece              | Meaning                                                                         |
| ------------------ | ------------------------------------------------------------------------------- |
| `@ApiTags('Auth')` | Puts every route on this controller under the **Auth** tag in the docs sidebar. |

Without `@ApiTags`, routes still appear but are harder to browse as the API grows. Add one tag per feature controller (e.g. `@ApiTags('Users')` later).

### DTO tags (`@ApiProperty`)

Makes each request-body field visible in Swagger with type, example, and required flag. Without `@ApiProperty`, Swagger often cannot infer a useful schema for the body.

```ts
export class SigninDto {
  @ApiProperty({
    type: String,
    example: 'testuser@gmail.com',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    type: String,
    example: 'Test@123',
    required: false,
  })
  @IsNotEmpty()
  @IsStrongPassword()
  readonly password: string;
}
```

Same pattern on `SignupDto` for `name`, `email`, and `password`.

| `@ApiProperty` option | Meaning                                                     |
| --------------------- | ----------------------------------------------------------- |
| `type`                | OpenAPI type shown in the schema (`String`, etc.).          |
| `example`             | Sample value pre-filled in “Try it out”.                    |
| `required`            | Whether Swagger marks the field as required in the docs UI. |

**Note:** `@ApiProperty` is **documentation only**. Runtime validation still comes from `class-validator` + the global `ValidationPipe`. Keep both: Swagger for humans, validators for the server.

```
main.ts (DocumentBuilder + setup)
        │
        ▼
  /corify/docs UI
        │
   ┌────┴────┐
   ▼         ▼
@ApiTags   @ApiProperty
(controller) (DTO fields)
```

---

## Exception filter & response interceptor

`AppModule` registers a **global exception filter** and a **global response interceptor** so every route returns the same envelope:

```ts
{
  (success, message, data, metadata);
}
```

```ts
// app.module.ts
providers: [
  { provide: APP_FILTER, useClass: ExceptionsFilter },
  { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
],
```

| Token             | Class                  | Role                                               |
| ----------------- | ---------------------- | -------------------------------------------------- |
| `APP_FILTER`      | `ExceptionsFilter`     | Catch thrown errors and shape the error response.  |
| `APP_INTERCEPTOR` | `TransformInterceptor` | Wrap successful handler results in the same shape. |

```
Request
   │
   ▼
Controller / Service
   │
   ├── success ──► TransformInterceptor ──► { success: true, message, data, metadata }
   │
   └── throw ────► ExceptionsFilter ──────► { success: false, message, data: null, metadata: null }
```

---

### Exception filter (`common/filter`)

**Role:** Global catch-all. Any unhandled exception (validation `400`, auth `401`/`403`, unexpected `500`, etc.) is turned into a consistent JSON body instead of Nest’s default error format.

```ts
@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = Array.isArray(exception?.response?.message)
      ? exception.response.message.join(', ')
      : exception?.response?.message || 'Something went wrong';

    const responseBody = {
      success: false,
      message: message,
      data: null,
      metadata: null,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
```

| Piece                     | Meaning                                                                |
| ------------------------- | ---------------------------------------------------------------------- |
| `@Catch()`                | Catch **all** exception types (not only `HttpException`).              |
| `HttpAdapterHost`         | Platform-agnostic reply helper (works with Express or Fastify).        |
| `exception.getStatus()`   | Use the status from Nest `HttpException`s; otherwise default to `500`. |
| `response.message` join   | Flatten validation-pipe message arrays into one string.                |
| `success: false` envelope | Same keys as success responses so clients always read one shape.       |

**Example error response** (e.g. failed DTO validation):

```json
{
  "success": false,
  "message": "email must be an email, password is not strong enough",
  "data": null,
  "metadata": null
}
```

---

### Transform interceptor (`common/interceptor`)

**Role:** Runs after a successful handler. If the handler already returned the envelope (`success` is set), it passes through; otherwise it wraps the result.

```ts
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((result) => {
        if (result?.success !== undefined) return result;

        return {
          success: true,
          message: result?.message ?? 'Success',
          data: result?.data ?? null,
          metadata: result?.metadata ?? null,
        };
      }),
    );
  }
}
```

| Piece                           | Meaning                                                                                 |
| ------------------------------- | --------------------------------------------------------------------------------------- |
| `next.handle()`                 | Continues to the route handler; returns an RxJS `Observable` of the result.             |
| `map(...)`                      | Transforms the outgoing value before it is sent to the client.                          |
| `result?.success !== undefined` | Skip wrapping when the service already returned `{ success, message, data, metadata }`. |
| Defaults (`'Success'`, `null`)  | Fill missing `message` / `data` / `metadata` so the envelope is always complete.        |

**Example success response** (handler returns `{ data: { access_token, user }, message: 'Signed in' }`):

```json
{
  "success": true,
  "message": "Signed in",
  "data": {
    "access_token": "...",
    "user": { "_id": "...", "email": "..." }
  },
  "metadata": null
}
```

Services can return either a bare payload (interceptor wraps it) or the full envelope (interceptor leaves it alone). Errors never reach this interceptor — the filter handles those.
