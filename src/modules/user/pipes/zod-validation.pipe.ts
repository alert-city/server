import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { z, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: z.ZodSchema<any>) {}

  transform(value: any, metadata: ArgumentMetadata) {
    try {
      return this.schema.parse(value); // 验证传入的值
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(error.errors);
      }
    }
  }
}
