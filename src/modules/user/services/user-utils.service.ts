import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserResponseDto } from '@/modules/user/dtos/user-response.dto';
import { UserRequestDto } from '@/modules/user/dtos/user-request.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { CustomException } from '@/common/exceptions/user.exception';
import {
  TOKEN_NOT_MATCH,
  TOKEN_EXPIRED
} from '@/common/constants/code';

@Injectable()
export class UserUtilsService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserResponseDto>,
    private readonly jwtService: JwtService,
  ) {
  }

  async isUsernameTaken(username: string): Promise<boolean> {
    const foundUser = await this.userModel.findOne({ username });
    return !!foundUser;
  }

  async isOrgExist(orgName: string): Promise<boolean> {
    const foundUsers = await this.userModel.find({orgName}).exec();
    return foundUsers.length >= 1;
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async generateToken(id:string): Promise<string> {
    return this.jwtService.sign({ id }, { expiresIn: '1h' });
  }

  async getIdFromToken(token: string): Promise<string> {
    const decoded = this.jwtService.decode(token);
    return decoded.id;
  }

  async verifyToken(token: string,tokenFromFB:string): Promise<boolean> {
    if (token !== tokenFromFB) {
      throw new CustomException('Token not match', 'TOKEN_NOT_MATCH', TOKEN_NOT_MATCH);
    }
    try {
      this.jwtService.verify(token);
      return true;
    } catch (e) {
      throw  new CustomException('Token expired', 'TOKEN_EXPIRED', TOKEN_EXPIRED);
    }
  }

}