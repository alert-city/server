import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UnifiedErrorStrategy } from './unified-error-strategy.interface';
import { UserUtilsService } from '@/modules/user/services/user-utils.service';
import { CustomException } from '@/common/exceptions/custom-exception';
import {
  VALIDATION_ERROR,
  AUTHORIZATION_ERROR,
  FORBIDDEN_ERROR,
  CONFLICT_ERROR,
  INTERNAL_SERVER_ERROR,
  ACCOUNT_NOT_ACTIVATED,
} from '@/common/constants/code';
import { Types } from 'mongoose';
import { I18nService } from '@/modules/i18n/i18n.service';

@Injectable()
export class UnifiedErrorStrategyImpl implements UnifiedErrorStrategy {
  constructor(
    @Inject(forwardRef(() => UserUtilsService))
    private readonly userUtilsService: UserUtilsService,
    private readonly i18nService: I18nService,
  ) {}

  private t(key: string): string {
    return this.i18nService.getTranslation(key);
  }

  async execute(input: {
    type: string;
    username?: string;
    orgName?: string;
    singleObj?: any;
    arrayObj?: any;
    message?: string;
    id?: string;
    code?: number;
    codeName?: string;
    string: { string1?: string; string2?: string };
    user?: any;
    password?: { passwordFromFE: string; passwordFromDB: string };
    trueOrFalse?: boolean;
    expires?: Date;
  }): Promise<void> {
    switch (input.type) {
      case 'USERNAME_EXISTS':
        const isUsernameTaken = await this.userUtilsService.isUsernameTaken(
          input.username,
        );
        if (isUsernameTaken) {
          throw new CustomException(this.t('usernameExists'), CONFLICT_ERROR);
        }
        break;

      case 'USERNAME_EXISTS_NOT_ACTIVATE':
        const { result, id } =
          await this.userUtilsService.isUsernameTakenNotActivate(
            input.username,
          );
        if (result === true) {
          throw new CustomException(
            this.t('usernameExistsNotActivated'),
            ACCOUNT_NOT_ACTIVATED,
            id,
          );
        }
        if (result === false) {
          throw new CustomException(this.t('usernameExists'), CONFLICT_ERROR);
        }
        break;

      case 'ORGANIZATION_EXISTS':
        const isOrganizationExist = await this.userUtilsService.isOrgExist(
          input.orgName,
        );
        if (isOrganizationExist) {
          throw new CustomException(
            this.t('organizationExists'),
            CONFLICT_ERROR,
          );
        }
        break;

      case 'IS_ARRAY_OBJ_EMPTY':
        if (input.arrayObj.length === 0) {
          throw new CustomException(input.message, input.code);
        }
        break;

      case 'IS_SINGLE_OBJ_EXIST':
        if (!input.singleObj) {
          throw new CustomException(input.message, input.code);
        }
        break;

      case 'ID_VALIDATION':
        if (!Types.ObjectId.isValid(input.id)) {
          throw new CustomException(
            this.t('invalidIdFormat'),
            VALIDATION_ERROR,
          );
        }
        break;

      case 'COMPARE_TWO_STRINGS_EQUAL':
        if (input.string.string1 === input.string.string2) {
          throw new CustomException(input.message, VALIDATION_ERROR);
        }
        break;

      case 'COMPARE_TWO_STRINGS_NOT_EQUAL':
        if (input.string.string1 !== input.string.string2) {
          throw new CustomException(input.message, VALIDATION_ERROR);
        }
        break;

      case 'VALIDATE_ACCOUNT_TYPE_FOR_UPDATE':
        const accountType = input.user.accountType;
        if (accountType === 'Organization') {
          const hasFirstName = 'firstName' in input.singleObj;
          const hasLastName = 'lastName' in input.singleObj;
          if (hasFirstName || hasLastName) {
            throw new CustomException(
              this.t('organizationCannotUpdateName'),
              FORBIDDEN_ERROR,
            );
          }
        }
        if (accountType === 'Personal') {
          const hasOrgName = 'orgName' in input.singleObj;
          if (hasOrgName) {
            throw new CustomException(
              this.t('personalCannotUpdateOrgName'),
              FORBIDDEN_ERROR,
            );
          }
        }
        break;

      case 'IS_ACCOUNT_ACTIVATED':
        if (!input.singleObj?.isAccountActivated) {
          throw new CustomException(
            this.t('accountNotActivated'),
            ACCOUNT_NOT_ACTIVATED,
            input.id,
          );
        }
        break;

      case 'NORMAL_ACCOUNT_NOT_ALLOWED':
        if (
          !input.singleObj.role?.includes('staff') &&
          !input.singleObj.role?.includes('admin')
        ) {
          throw new CustomException(
            this.t('normalAccountNotAllowed'),
            FORBIDDEN_ERROR,
          );
        }
        break;

      case 'IS_PASSWORD_VALID':
        const isPasswordValid = await this.userUtilsService.comparePassword(
          input.password.passwordFromFE,
          input.password.passwordFromDB,
        );
        if (!isPasswordValid) {
          throw new CustomException(
            this.t('passwordNotMatch'),
            AUTHORIZATION_ERROR,
          );
        }
        break;

      case 'IS_PASSWORD_SAME':
        const isPasswordSame = await this.userUtilsService.comparePassword(
          input.password.passwordFromFE,
          input.password.passwordFromDB,
        );
        if (isPasswordSame) {
          throw new CustomException(
            this.t('newPasswordCannotBeSame'),
            AUTHORIZATION_ERROR,
          );
        }
        break;

      case 'TRUE_OR_FALSE':
        if (!input.trueOrFalse) {
          throw new CustomException(input.message, AUTHORIZATION_ERROR);
        }
        break;

      case 'DIRECT_THROW':
        throw new CustomException(input.message, input.code);

      case 'IS_EXPIRED':
        const now = new Date();
        if (input.expires < now) {
          throw new CustomException(input.message, VALIDATION_ERROR);
        }
        break;

      default:
        throw new CustomException(
          this.t('invalidErrorType'),
          INTERNAL_SERVER_ERROR,
        );
    }
  }
}
