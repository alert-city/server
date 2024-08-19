import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserService } from '@/modules/user/user.service';
import { ConfigService } from '@nestjs/config';
import { CustomException } from '@/common/exceptions/user.exception';
import {
  USER_NOT_FOUND,
  ACCESS_TOKEN_VALIDATION_FAILED
} from '@/common/constants/code';


@Injectable()
export class AccessJwtStrategy extends PassportStrategy(Strategy, 'jwt-access-token') {
  constructor(
  private readonly userService: UserService,
  private readonly configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any): Promise<any> {
    const user = await this.userService.findOneUser(payload.id);
    if (!user) {
      throw new CustomException('Access token Validate failed', 'ACCESS_TOKEN_VALIDATION_FAILED', ACCESS_TOKEN_VALIDATION_FAILED);
    }
    return user;
  }
}
