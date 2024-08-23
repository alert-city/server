import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/modules/user/user.service';
import { Request } from 'express';
import { CustomException } from '@/common/exceptions/user.exception';
import {
  USER_NOT_FOUND
} from '@/common/constants/code';
import { UserUtilsService } from '@/modules/user/user-utils.service';

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
    private readonly userUtilsService: UserUtilsService,
  ) {
  }

  async processToken(req: Request): Promise<RefreshTokenResponse> {
    const authHeader = req.headers.authorization;
    let id: string;
    let accessTokenFromDB: string;
    let accessTokenFromRequest: string;
    let refreshTokenFromDB: string;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessTokenFromRequest = authHeader.split(' ')[1];
      const decoded = this.jwtService.decode(accessTokenFromRequest);
      id = decoded.id;
      const user = await this.userService.findOneUser(id);
      if (!user) {
        throw new CustomException('User not found', 'USER_NOT_FOUND', USER_NOT_FOUND);
      }
      refreshTokenFromDB = user.refreshToken;
      accessTokenFromDB = user.accessToken;
      req.headers['x-refresh-token'] = refreshTokenFromDB;
    }
    return { accessTokenFromRequest, accessTokenFromDB, id };
  }
}
