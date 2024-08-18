import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserResponseDto } from '@/modules/user/dtos/user-response.dto';
import { UserRequestDto } from '@/modules/user/dtos/user-request.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserUtilsService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserResponseDto>,
  ) {
  }

  async isUsernameTaken(username: string): Promise<boolean> {
    const foundUser = await this.userModel.findOne({ username });
    return !!foundUser;
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
}