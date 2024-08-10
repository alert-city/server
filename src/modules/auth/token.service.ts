import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/modules/user/user.service';
import { Request } from 'express';

export interface RefreshTokenResponse {
id: string;
refreshToken: string;
}


@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async processToken(req: Request): Promise<RefreshTokenResponse> {
    // console.log("req", req.headers.authorization);
    const authHeader = req.headers.authorization;
    let id: string;
    let refreshToken: string;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const accessToken = authHeader.split(' ')[1];
      const decoded = this.jwtService.decode(accessToken);
      id = decoded.id;
      // console.log("id in token service", id);
      const user = await this.userService.findOneUser(id);
      if (!user) {
        throw new Error('User not found');
      }
      refreshToken = user.refreshToken;
      req.headers['x-refresh-token'] = refreshToken;
      console.log("refresh token 已经添加到 req 对象中");
      console.log("ID 已返回！");
    }
    return { id, refreshToken };
  }
}
