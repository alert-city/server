import { HttpException, HttpStatus } from '@nestjs/common';

export class UpdateFailedException extends HttpException {
  constructor() {
    super('User not updated', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}