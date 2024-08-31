import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/modules/user/services/user.service';
import { Request } from 'express';
import { CustomException } from '@/common/exceptions/user.exception';
import {
  USER_NOT_FOUND
} from '@/common/constants/code';

export interface RefreshTokenResponse {
  id: string;
  accessTokenFromRequest: string;
  accessTokenFromDB: string;
}


@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {
  }

  async processToken(req: Request): Promise<RefreshTokenResponse> {
    let accessTokenFromRequest = ""
    const cookies = req.headers.cookie;
    if (cookies) {
      const cookieArray = cookies.split(';');
      for (let cookie of cookieArray) {
        cookie = cookie.trim();
        if (cookie.startsWith('access_token=')) {
          accessTokenFromRequest = cookie.substring('access_token='.length);
        }
      }
    }

    let id: string;
    let accessTokenFromDB: string;
    let refreshTokenFromDB: string;

    if (accessTokenFromRequest) {
      const decoded = this.jwtService.decode(accessTokenFromRequest);
      id = decoded.id;
      const user = await this.userService.findOneUser(id);
      if (!user) {
        throw new CustomException('User not found', 'USER_NOT_FOUND', USER_NOT_FOUND);
      }
      refreshTokenFromDB = user.refreshToken;
      accessTokenFromDB = user.accessToken;
      req.headers['x-refresh-token'] = refreshTokenFromDB;
    } else {
      throw new CustomException('Access token not found in cookies', 'TOKEN_NOT_FOUND', 401);
    }

    return { accessTokenFromRequest, accessTokenFromDB, id };
  }
}
