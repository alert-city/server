import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodError } from 'zod';
import { CustomException } from '@/common/exceptions/custom-exception';
import { VALIDATION_ERROR } from '@/common/constants/code';
import {
  UpdateUserRequestDto,
  ResetPasswordRequestDto,
} from '@/modules/user/dtos/user-request.dto';
import {
  createUserSchema,
  updateUserSchema,
} from '@/validation/schemas/user/user.schema';
import { UserRequestDto } from '@/modules/user/dtos/user-request.dto';
import { resetPasswordSchema } from '@/validation/schemas/reset-password/reset-password.schema';
import { SendUpdateUsernameEmailRequestDto } from '@/modules/notification/dtos/notification-request.dto';
import { updateUsernameSchema } from '@/validation/schemas/update-profile/update-profile.schema';
import { LoginRequestDto } from '@/modules/auth/dtos/login-request.dto';
import { loginSchema } from '@/validation/schemas/login/login.schema';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  private schemas = new Map();

  constructor() {
    this.schemas.set(UpdateUserRequestDto, updateUserSchema);
    this.schemas.set(UserRequestDto, createUserSchema);
    this.schemas.set(ResetPasswordRequestDto, resetPasswordSchema);
    this.schemas.set(SendUpdateUsernameEmailRequestDto, updateUsernameSchema);
    this.schemas.set(LoginRequestDto, loginSchema);
  }

  transform(value: any, metadata: ArgumentMetadata) {
    const schema = this.schemas.get(metadata.metatype);
    if (!schema) {
      return value;
    }

    try {
      return schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new CustomException(
          `Zod Validation Failed: ${error.message}`,
          VALIDATION_ERROR,
        );
      }
    }
  }
}
