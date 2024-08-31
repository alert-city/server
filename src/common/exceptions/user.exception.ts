import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomException extends HttpException {
  constructor(message: any, code: string, status: number, data?: any) {
    super({
      message,
      code,
      data,
    }, status);
  }
}