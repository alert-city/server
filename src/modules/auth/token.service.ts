import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/modules/user/user.service';
import { Request } from 'express';

export interface RefreshTokenResponse {
  id: string;
  accessTokenFromRequest: string;
  accessTokenFromDB: string;
}


@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {
  }

  async processToken(req: Request): Promise<RefreshTokenResponse> {
    // console.log("req", req.headers.authorization);
    const authHeader = req.headers.authorization;
    let id: string;
    let accessTokenFromDB: string;
    let accessTokenFromRequest: string;
    let refreshTokenFromDB: string;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessTokenFromRequest = authHeader.split(' ')[1];
      const decoded = this.jwtService.decode(accessTokenFromRequest);
      id = decoded.id;
      // console.log("id", id);
      const user = await this.userService.findOneUser(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      refreshTokenFromDB = user.refreshToken;
      // console.log('refresh token From DB: ', refreshTokenFromDB);
      accessTokenFromDB = user.accessToken;
      req.headers['x-refresh-token'] = refreshTokenFromDB;
      // console.log('refresh token 已经添加到 req 对象中');
      // console.log('ID 已返回！');
    }
    return { accessTokenFromRequest, accessTokenFromDB, id };
  }
}
