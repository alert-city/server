import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { z, ZodError } from 'zod';
import { CustomException } from '@/common/exceptions/user.exception';
import {
  VALIDATE_ERROR,
} from '@/common/constants/code';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: z.ZodSchema<any>) {
  }

  transform(
    value: any,
    metadata: ArgumentMetadata,
  ) {
    try {
      return this.schema.parse(value); // 验证传入的值
    } catch (error) {
      if (error instanceof ZodError) {
        throw new CustomException('Zod Validation Failed', 'VALIDATE_ERROR', VALIDATE_ERROR, error.errors);
      }
    }
  }
}
