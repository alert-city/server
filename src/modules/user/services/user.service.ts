import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { EmailLinkValidationResponseDto } from '@/modules/notification/dtos/notification-response.dto';
import { UserResponseDto } from '@/modules/user/dtos/user-response.dto';
import { UpdateUserRequestDto, UserRequestDto} from '@/modules/user/dtos/user-request.dto';
import { UserUtilsService } from '@/modules/user/services/user-utils.service';
import { NotificationService } from '@/modules/notification/notification.service';
import { SendUpdateUsernameEmailRequestDto } from '@/modules/notification/dtos/notification-request.dto';
import { ErrorContext } from '@/common/adjustment-strategies/error-context';
import { UnifiedErrorStrategyImpl } from '@/common/adjustment-strategies/unified-error.strategy';
import { NOT_FOUND_ERROR } from '@/common/constants/code';
import { I18nService } from '@/modules/i18n/i18n.service';
import { ConfigService } from '@nestjs/config';
import { PubSub } from 'graphql-subscriptions';

@Injectable()
export class UserService {
  private readonly errorContext: ErrorContext;

  constructor(
    @InjectModel('User') private readonly userModel: Model<UserResponseDto>,
    @InjectModel(
      'EmailLinkValidation') private readonly emailLinkValidationModel: Model<EmailLinkValidationResponseDto>,
    private readonly userUtilsService: UserUtilsService,
    @Inject(forwardRef(() => NotificationService)) private readonly notificationService: NotificationService,
    private readonly unifiedErrorStrategy: UnifiedErrorStrategyImpl,
    private readonly i18nService: I18nService,
    private readonly configService: ConfigService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {
    this.errorContext = new ErrorContext(this.unifiedErrorStrategy);
  }

  private t(key: string): string {
    return this.i18nService.getTranslation(key);
  }

  async findAllUsers(): Promise<UserResponseDto[]> {
    const allUsers = await this.userModel.find().select('-password').exec();
    await this.errorContext.execute(
      { type: 'IS_ARRAY_OBJ_EMPTY', arrayObj: allUsers, message: this.t('userNotFound'), code: NOT_FOUND_ERROR });
    return allUsers;
  }

  async findUserByUsername(username: string): Promise<UserResponseDto> {
    const foundUser = await this.userModel.findOne({ username }).exec();
    await this.errorContext.execute(
      {
        type: 'IS_SINGLE_OBJ_EXIST', singleObj: foundUser, message: this.t('usernameNotExists'),
        code: NOT_FOUND_ERROR,
      });
    return foundUser;
  }

  async findOneUser(id: string): Promise<UserResponseDto> {
    await this.errorContext.execute({ type: 'ID_VALIDATION', id });
    const foundUser = await this.userModel.findById(id).select('-password').exec();
    await this.errorContext.execute(
      { type: 'IS_SINGLE_OBJ_EXIST', singleObj: foundUser, message: this.t('userNotFound'), code: NOT_FOUND_ERROR });
    return foundUser;
  }

  async updateUser(
    id: string,
    input: UpdateUserRequestDto,
  ): Promise<boolean> {
    await this.errorContext.execute({ type: 'ID_VALIDATION', id });
    const foundUser = await this.findOneUser(id);
    await this.errorContext.execute({ type: 'VALIDATE_ACCOUNT_TYPE_FOR_UPDATE', user: foundUser, singleObj: input });
    const hasOrgName = 'orgName' in input;
    if (foundUser.accountType === 'Organization' && hasOrgName) {
      await this.errorContext.execute({
        type: 'COMPARE_TWO_STRINGS_EQUAL', string: { string1: input.orgName, string2: foundUser.orgName },
        message: this.t('newOrgNameCannotBeSame'),
      });
      await this.errorContext.execute({ type: 'ORGANIZATION_EXISTS', orgName: input.orgName });
    }
    const updatedUser = await this.userModel.findByIdAndUpdate(id, input, {
      new: true,
    }).select('-password').exec();
    if (updatedUser) {
      await this.pubSub.publish('userUpdated', { userUpdated: updatedUser });
    }
    return !!updatedUser;
  }

  async createUser(input: UserRequestDto, locale: string): Promise<UserResponseDto> {
    delete input.confirmPassword;
    const recaptchaToken = input.captchaToken;
    const secretKey = this.configService.get('CAPTCHA_SECRET_KEY');
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;
    await this.errorContext.execute({ type: 'USERNAME_EXISTS_NOT_ACTIVATE', username: input.username });
    if (input.accountType === 'Organization') {
      await this.errorContext.execute({ type: 'ORGANIZATION_EXISTS', orgName: input.orgName });
    }
    const emailInfoType = input.emailInfoType || 0;
    delete input.emailInfoType;
    input.password = await this.userUtilsService.hashPassword(input.password);
    const userInfo = { ...input, isAccountActivated: false, isFirstLogin: true };
    const newUser = await this.userModel.create(userInfo);
    const result = await this.notificationService.sendActivationLinkEmail({ user: newUser, emailInfoType, locale });
    result && await this.updateUser(newUser.id, { isAccountActivated: false });
    const { password, ...userWithoutPassword } = newUser.toObject();
    return userWithoutPassword as UserResponseDto;
  }

  async deleteUser(id: string): Promise<boolean> {
    await this.errorContext.execute({ type: 'ID_VALIDATION', id });
    const deletedUser = await this.userModel.findByIdAndDelete(id).select('-password').exec();
    await this.errorContext.execute(
      {
        type: 'IS_SINGLE_OBJ_EXIST', singleObj: deletedUser, message: this.t('userNotFound'), code: NOT_FOUND_ERROR,
      });
    return true;
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
    await this.errorContext.execute(
      { type: 'IS_ARRAY_OBJ_EMPTY', arrayObj: records, message: this.t('tokenNotFound'), code: NOT_FOUND_ERROR });
    const latestRecord = records[0];
    await this.errorContext.execute(
      {
        type: 'IS_SINGLE_OBJ_EXIST', singleObj: latestRecord, message: this.t('tokenNotFound'), code: NOT_FOUND_ERROR,
      });
    const activationToken = latestRecord.activationToken;
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
    await this.emailLinkValidationModel.deleteMany({ userId: userId }).exec();
    return true;
  }

  async resendActivationLinkEmail({ id, emailInfoType, newUsername, locale }): Promise<boolean> {
    const foundUser = await this.findOneUser(id);
    await this.errorContext.execute(
      { type: 'IS_SINGLE_OBJ_EXIST', singleObj: foundUser, message: this.t('idNotFound'), code: NOT_FOUND_ERROR });
    await this.emailLinkValidationModel.deleteMany({ userId: id }).exec();
    return await this.notificationService.sendActivationLinkEmail(
      { user: foundUser, emailInfoType, newUsername, locale });
  }

  async sendUpdateUsernameEmail(
    id: string,
    input: SendUpdateUsernameEmailRequestDto,
    locale: string,
  ): Promise<boolean> {
    const { newUsername, emailInfoType } = input;
    const user = await this.findOneUser(id);
    await this.errorContext.execute(
      {
        type: 'COMPARE_TWO_STRINGS_EQUAL', string: { string1: newUsername, string2: user.username },
        message: this.t('newUsernameCannotBeSame'),
      });
    await this.errorContext.execute({ type: 'USERNAME_EXISTS', username: newUsername });
    return await this.notificationService.sendActivationLinkEmail({ user, emailInfoType, newUsername, locale });
  }

}