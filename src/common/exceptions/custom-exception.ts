import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomException extends HttpException {
  constructor(message: any, statusCode: number, data?: any) {
    super({
      message,
      data,
    }, statusCode);
  }
}