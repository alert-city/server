import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserService } from '@/modules/user/services/user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AccessJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-access-token',
) {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(), // 👈 优先从 Authorization header 读取
        (request) => {
          // 兼容：如果没有，再从 Cookie 读取
          const cookies = request.headers.cookie;
          if (cookies) {
            const cookieArray = cookies.split(';');
            for (let cookie of cookieArray) {
              cookie = cookie.trim();
              if (cookie.startsWith('access_token=')) {
                return cookie.substring('access_token='.length);
              }
            }
          }
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any): Promise<any> {
    return await this.userService.findOneUser(payload.id);
  }
}
