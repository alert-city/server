import { HttpException, HttpStatus } from '@nestjs/common';

export class UpdateFailedException extends HttpException {
  constructor() {
    super('User not updated', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class CustomException extends HttpException {
  constructor(message: any, code: string, status: number) {
    super({
      message,
      code,
    }, status);
  }
}