import { Injectable } from '@nestjs/common';
import { UserRepository } from '../database/repositories/user.repository';
import { SignupDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async signup(payload: SignupDto) {
    console.log(payload);
    // todo:
  }
}
