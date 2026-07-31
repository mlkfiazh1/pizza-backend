import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from '../database/repositories/user.repository';
import { SignupDto } from './auth.dto';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async signup(payload: SignupDto) {
    console.log(payload);
    const user = await this.userRepository.findOne({
      email: payload.email,
      status: { $in: [1, 2] },
    });

    if (user) {
      throw new BadRequestException('User Already Exist');
    }

    payload.password = await bcrypt.hash(payload.password, 12);
    await this.userRepository.create({ _id: new Types.ObjectId(), ...payload });

    return;
  }
}
