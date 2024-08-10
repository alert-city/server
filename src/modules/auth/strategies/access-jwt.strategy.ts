import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '@/modules/user/user.service';
import { ConfigService } from '@nestjs/config';


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
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
