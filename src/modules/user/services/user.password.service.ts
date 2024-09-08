import { Injectable } from '@nestjs/common';
import { ResetPasswordRequestDto } from '@/modules/user/dtos/user-request.dto';
import { UserService } from './user.service';
import { UserUtilsService } from '@/modules/user/services/user-utils.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailCodeValidationResponseDto } from '@/modules/notification/dtos/notification-response.dto';
import { ErrorContext } from '@/common/adjustment-strategies/error-context';
import { UnifiedErrorStrategyImpl } from '@/common/adjustment-strategies/unified-error.strategy';
import { NOT_FOUND_ERROR } from '@/common/constants/code';
import { I18nService } from '@/modules/i18n/i18n.service';

@Injectable()
export class UserPasswordService {
  private readonly errorContext: ErrorContext;

  constructor(
    private readonly userService: UserService,
    private readonly userUtilsService: UserUtilsService,
    @InjectModel(
      'EmailCodeValidation') private readonly EmailCodeValidationModel: Model<EmailCodeValidationResponseDto>,
    private readonly unifiedErrorStrategy: UnifiedErrorStrategyImpl,
    private readonly i18nService: I18nService,
  ) {
    this.errorContext = new ErrorContext(this.unifiedErrorStrategy);
  }

  private t(key: string): string {
    return this.i18nService.getTranslation(key);
  }

  async resetPassword(
    username: string,
    input: ResetPasswordRequestDto
  ): Promise<boolean> {
    const user = await this.userService.findUserByUsername(username);
    await this.errorContext.execute(
      {
        type: 'IS_SINGLE_OBJ_EXIST', singleObj: user, message: this.t('usernameNotExists'),
        code: NOT_FOUND_ERROR,
      });
    const id = user.id;
    const records = await this.EmailCodeValidationModel.find({ userId: id }).sort({ createdAt: -1 }).exec();
    const latestRecord = records[0];
    const storedPassword = user.password;
    await this.errorContext.execute(
      {
        type: 'IS_SINGLE_OBJ_EXIST', singleObj: latestRecord, message: this.t('verificationCodeNotMatch'),
        code: NOT_FOUND_ERROR,
      });
    const { verificationCode, expires } = latestRecord;
    input.verificationCode = input.verificationCode.trim();
    await this.errorContext.execute({
      type: 'COMPARE_TWO_STRINGS_NOT_EQUAL', string: { string1: input.verificationCode, string2: verificationCode },
      message: this.t('verificationCodeNotMatch'),
    });
    await this.errorContext.execute(
      { type: 'IS_PASSWORD_SAME', password: { passwordFromFE: input.password, passwordFromDB: storedPassword } });
    await this.errorContext.execute(
      { type: 'IS_EXPIRED', expires: expires, message: this.t('verificationCodeExpired') });
    input.password = await this.userUtilsService.hashPassword(input.password);
    await this.userService.updateUser(id, { password: input.password });
    await this.EmailCodeValidationModel.deleteMany({ userId: id });
    return true;
  }
}
