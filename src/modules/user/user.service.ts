import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserResponseDto } from '@/common/dtos/user-response.dto';
import { UserRequestDto } from '@/common/dtos/user-request.dto';
import { UpdateUserRequestDto } from '@/common/dtos/user-request.dto';
import * as bcrypt from 'bcryptjs';


@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserResponseDto>,
  ) {
  }

  async findAllUsers(): Promise<UserResponseDto[]> {
    const allUsers = await this.userModel.find().exec();
    if (allUsers.length === 0) {
      throw new NotFoundException('Users not found');
    }
    return allUsers;
  }

  async findUserByUsername(username: string): Promise<UserResponseDto> {
    const foundUser = await this.userModel.findOne({ username });
    if (!foundUser) {
      throw new NotFoundException('User not found');
    }
    return foundUser;
  }

  async findOneUser(id: string): Promise<UserResponseDto> {
    // console.log('id in service', id);
    const foundUser = await this.userModel.findById(id).exec();
    // console.log('foundUser in service', foundUser);
    if (!foundUser) {
      throw new NotFoundException('User not found');
    }
    return foundUser;
  }

  async updateUser(
    id: string,
    input: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    const updatedUser = await this.userModel.findByIdAndUpdate(id, input, {
      new: true,
    }).exec();
    if (!updatedUser) {
      throw new NotFoundException('User not updated');
    }
    // console.log('updatedUser', updatedUser);
    return updatedUser;
  }

  async createUser(input: UserRequestDto): Promise<UserResponseDto> {
    input.password = await bcrypt.hash(input.password, 10);
    const newUser = await this.userModel.create(input);
    if (!newUser) {
      throw new NotFoundException('User not created');
    }
    return newUser;
  }

  async deleteUser(id: string): Promise<boolean> {
  const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
  if (!deletedUser) {
    throw new NotFoundException('User not deleted');
  }
  return true;
  }

}