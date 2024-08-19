import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserService } from '@/modules/user/user.service';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { CustomException } from '@/common/exceptions/user.exception';
import {
  UNAUTHORIZED,
  REFRESH_TOKEN_VALIDATION_FAILED
} from '@/common/constants/code';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => {
        let token = null;
        if (req && req.headers['x-refresh-token']) {
          token = req.headers['x-refresh-token'];
        }
        return token;
      }]),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findOneUser(payload.id);
    if (!user) {
      throw new CustomException('Refresh token validate failed', 'REFRESH_TOKEN_VALIDATION_FAILED', REFRESH_TOKEN_VALIDATION_FAILED);
    }
    return user;
  }
}

