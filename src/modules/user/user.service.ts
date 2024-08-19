import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserResponseDto } from '@/modules/user/dtos/user-response.dto';
import { UpdateUserRequestDto, VerificationInfoRequestDto, UserRequestDto } from '@/modules/user/dtos/user-request.dto';
import { UserUtilsService } from '@/modules/user/user-utils.service';
import { CustomException } from '@/common/exceptions/user.exception';
import {
  CREATE_USER_ERROR,
  UPDATE_ERROR,
  DELETE_USER_ERROR,
  ACCOUNT_EXIST,
  USER_NOT_FOUND, USER_NOT_EXIST,
} from '@/common/constants/code';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserResponseDto>,
    private readonly userUtilsService: UserUtilsService,
  ) {
  }

  async findAllUsers(): Promise<UserResponseDto[]> {
    const allUsers = await this.userModel.find().select('-password').exec();
    if (allUsers.length === 0) {
      throw new CustomException('User not found', 'USER_NOT_FOUND', USER_NOT_FOUND);
    }
    return allUsers;
  }

  async findUserByUsername(username: string): Promise<UserResponseDto> {
    const foundUser = await this.userModel.findOne({ username }).exec();
    if (!foundUser) {
      throw new CustomException('User not exist', 'USER_NOT_EXIST', USER_NOT_EXIST);
    }
    return foundUser;
  }

  async findOneUser(id: string): Promise<UserResponseDto> {
    // console.log('id in service', id);
    const foundUser = await this.userModel.findById(id).select('-password').exec();
    // console.log('foundUser in service', foundUser);
    if (!foundUser) {
      throw new CustomException('User not found', 'USER_NOT_FOUND', USER_NOT_FOUND);
    }
    return foundUser;
  }

  async updateUser(
    id: string,
    input: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    const updatedUser = await this.userModel.findByIdAndUpdate(id, input, {
      new: true,
    }).select('-password').exec();
    if (!updatedUser) {
      throw new CustomException('User not updated', 'UPDATE_ERROR', UPDATE_ERROR);
    }
    // console.log('updatedUser', updatedUser);
    return updatedUser;
  }

  async createUser(input: UserRequestDto): Promise<UserResponseDto> {
    delete input.confirmPassword;
    const isUsernameTaken = await this.userUtilsService.isUsernameTaken(input.username)
    if (isUsernameTaken) {
      throw new CustomException('Username already exists', 'ACCOUNT_EXIST', ACCOUNT_EXIST);
    }
    input.password = await this.userUtilsService.hashPassword(input.password);
    const newUser = await this.userModel.create(input);
    if (!newUser) {
      throw new CustomException('User not created', 'CREATE_USER_ERROR', CREATE_USER_ERROR);
    }
    const { password, ...userWithoutPassword } = newUser.toObject();
    return userWithoutPassword as UserResponseDto;
  }

  async deleteUser(id: string): Promise<boolean> {
  const deletedUser = await this.userModel.findByIdAndDelete(id).select('-password').exec();
  if (!deletedUser) {
    throw new CustomException('User not deleted', 'DELETE_USER_ERROR', DELETE_USER_ERROR);
  }
  return true;
  }

  async getIdByUsername(username:string):Promise<string> {
    const foundUser = await this.findUserByUsername(username);
    if(foundUser.id){
      return foundUser.id;
    }
  }

  async getVerificationInfo(id:string):Promise<VerificationInfoRequestDto> {
    const foundUser = await this.findOneUser(id);
    if (foundUser.verificationInfo) {
      return foundUser.verificationInfo
    }
  }
}