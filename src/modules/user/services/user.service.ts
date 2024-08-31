import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { EmailLinkValidationResponseDto } from '@/modules/notification/dtos/notification-response.dto';
import { UserResponseDto } from '@/modules/user/dtos/user-response.dto';
import { UpdateUserRequestDto, UserRequestDto } from '@/modules/user/dtos/user-request.dto';
import { UserUtilsService } from '@/modules/user/services/user-utils.service';
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
  SAME_USERNAME,
  ID_INCORRECT,
} from '@/common/constants/code';
import { NotificationService } from '@/modules/notification/notification.service';
import { SendUpdateUsernameEmailRequestDto } from '@/modules/notification/dtos/notification-request.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserResponseDto>,
    @InjectModel('EmailLinkValidation') private readonly emailLinkValidationModel: Model<EmailLinkValidationResponseDto>,
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
    return updatedUser;
  }

  async updateUserByUsername(
    username: string,
    input: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {

    const orgName = input.orgName;
    if (orgName) {
      const isOrganizationExist = await this.userUtilsService.isOrgExist(orgName);
      if (isOrganizationExist) {
        throw new CustomException('Organization already exists', 'ORGANIZATION_EXIST', ORGANIZATION_EXIST);
      }
    }

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
    const { emailInfoType } = input;
    const result = await this.notificationService.sendActivationLinkEmail(newUser, emailInfoType);

    if (result) {
      await this.updateUser(newUser.id, { isAccountActivated: false });
    }

    const { password, ...userWithoutPassword } = newUser.toObject();
    return userWithoutPassword as UserResponseDto;
  }

  async deleteUser(id: string): Promise<boolean> {
    console.log('开始删除用户');
    console.log('id', id);

    if (!Types.ObjectId.isValid(id)) {
      throw new CustomException('Invalid User ID', 'ID_NOT_CORRECT', ID_INCORRECT);
    }

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

  async sendVerificationCodeEmail(
    username: string,
    emailInfoType: number,
  ): Promise<boolean> {
    return await this.notificationService.sendVerificationCodeEmail(username, emailInfoType);
  }

  async validateEmailLink(
    token: string,
    emailInfoType: number,
  ): Promise<boolean> {
    const userId = await this.userUtilsService.getIdFromToken(token);
    const records = await this.emailLinkValidationModel.find({ userId: userId }).sort({ createdAt: -1 }).exec();
    if (!records) {
      throw new CustomException('Token not found', 'TOKEN_NOT_FOUND', TOKEN_NOT_FOUND);
    }
    const latestRecord = records[0];
    if (!latestRecord) {
      throw new CustomException('Token not found', 'TOKEN_NOT_FOUND', TOKEN_NOT_FOUND);
    }
    const activationToken = latestRecord.activationToken;
    const ActivationTokenId = latestRecord.id;
    const isTokenValid = await this.userUtilsService.verifyToken(token, activationToken);
    if (!isTokenValid) {
      return false;
    }

    if (emailInfoType === 1) {
      await this.userModel.findByIdAndUpdate(userId, { isAccountActivated: true }).exec();
    }
    if (emailInfoType === 2) {
      const newUsername = latestRecord.newUsername;
      await this.userModel.findByIdAndUpdate(userId, { username: newUsername }).exec();
    }

    await this.emailLinkValidationModel.findByIdAndDelete(ActivationTokenId).exec();
    return true;
  }

  async resendActivationLinkEmail(
    username: string,
    emailInfoType: number,
    newUsername?: string,
  ): Promise<boolean> {
    const foundUser = await this.findUserByUsername(username);
    if (!foundUser) {
      throw new CustomException('Failed to retrieve user information', 'RETRIEVE_USER_ERROR', RETRIEVE_USER_ERROR);
    }
    return await this.notificationService.sendActivationLinkEmail(foundUser, emailInfoType, newUsername);
  }

  async sendUpdateUsernameEmail(
    username: string,
    input: SendUpdateUsernameEmailRequestDto,
  ): Promise<boolean> {
    const { newUsername, emailInfoType } = input;
    const user = await this.findUserByUsername(username);

    if (newUsername === user.username) {
      throw new CustomException('The new username cannot be the same as the current username', 'SAME_USERNAME', SAME_USERNAME);
    }

    const isUsernameTaken = await this.userUtilsService.isUsernameTaken(newUsername);
    if (isUsernameTaken) {
      throw new CustomException('Username already exists', 'ACCOUNT_EXIST', ACCOUNT_EXIST);
    }

    return await this.notificationService.sendActivationLinkEmail(user, emailInfoType, newUsername);
  }

}