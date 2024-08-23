import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AccountActivationResponseDto, UserResponseDto } from '@/modules/user/dtos/user-response.dto';
import { UpdateUserRequestDto, UserRequestDto } from '@/modules/user/dtos/user-request.dto';
import { UserUtilsService } from '@/modules/user/user-utils.service';
import { CustomException } from '@/common/exceptions/user.exception';
import { ConfigService } from '@nestjs/config';
import {
  ACCOUNT_EXIST,
  CREATE_USER_ERROR,
  DELETE_USER_ERROR,
  ORGANIZATION_EXIST,
  RETRIEVE_USER_ERROR,
  TOKEN_NOT_FOUND,
  UPDATE_ERROR,
  USER_NOT_FOUND,
} from '@/common/constants/code';
import { NotificationService } from '@/modules/notification/notification.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserResponseDto>,
    @InjectModel('AccountActivation') private readonly activationModel: Model<AccountActivationResponseDto>,
    private readonly userUtilsService: UserUtilsService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => NotificationService)) private readonly notificationService: NotificationService,
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
    return await this.userModel.findOne({ username }).exec();
  }

  async findOneUser(id: string): Promise<UserResponseDto> {
    const foundUser = await this.userModel.findById(id).select('-password').exec();
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

  async updateUserByUsername(
    username: string,
    input: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    const updatedUser = await this.userModel.findOneAndUpdate(
      { username },
      input,
      { new: true },
    ).select('-password').exec();
    if (!updatedUser) {
      throw new CustomException('User not updated', 'UPDATE_ERROR', UPDATE_ERROR);
    }
    // console.log('updatedUser', updatedUser);
    return updatedUser;
  }


  async createUser(input: UserRequestDto): Promise<UserResponseDto> {
    delete input.confirmPassword;
    const isUsernameTaken = await this.userUtilsService.isUsernameTaken(input.username);
    if (isUsernameTaken) {
      throw new CustomException('Username already exists', 'ACCOUNT_EXIST', ACCOUNT_EXIST);
    }

    if (input.accountType === 'Organization') {
      const orgName = input.orgName;
      const isOrganizationExist = await this.userUtilsService.isOrgExist(orgName);
      if (isOrganizationExist) {
        throw new CustomException('Organization already exists', 'ORGANIZATION_EXIST', ORGANIZATION_EXIST);
      }
    }

    input.password = await this.userUtilsService.hashPassword(input.password);
    const userInfo = { ...input, isAccountActivated: false };
    const newUser = await this.userModel.create(userInfo);
    if (!newUser) {
      throw new CustomException('User not created', 'CREATE_USER_ERROR', CREATE_USER_ERROR);
    }
    const result = await this.notificationService.sendAccountActivationEmail(newUser);

    if (result) {
      await this.updateUser(newUser.id, { isAccountActivated: false });
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

  async getIdByUsername(username: string): Promise<string> {
    const foundUser = await this.findUserByUsername(username);
    if (foundUser.id) {
      return foundUser.id;
    }
  }

  async activateUserAccount(token: string): Promise<boolean> {
    const userId = await this.userUtilsService.getIdFromToken(token);
    const records = await this.activationModel.find({ userId: userId }).sort({ createdAt: -1 }).exec();
    if (!records) {
      throw new CustomException('Token not found', 'TOKEN_NOT_FOUND', TOKEN_NOT_FOUND);
    }
    const latestRecord = records[0];
    if (!latestRecord) {
      throw new CustomException('Token not found', 'TOKEN_NOT_FOUND', TOKEN_NOT_FOUND);
    }
    const activationToken = latestRecord.activationToken
    const ActivationTokenId = latestRecord.id;
    const isTokenValid = await this.userUtilsService.verifyToken(token, activationToken);
    if (!isTokenValid) {
      return false;
    }
    await this.userModel.findByIdAndUpdate(userId, { isAccountActivated: true }).exec();
    await this.activationModel.findByIdAndDelete(ActivationTokenId).exec();
    return true;
  }

  async resendActivationEmail(username: string): Promise<boolean> {
    const foundUser = await this.findUserByUsername(username);
    if (!foundUser) {
      throw  new CustomException('Failed to retrieve user information', 'RETRIEVE_USER_ERROR', RETRIEVE_USER_ERROR);
    }
    return await this.notificationService.sendAccountActivationEmail(foundUser);
  }
}