import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Injectable, NotFoundException } from '@nestjs/common';
import { TokenService } from '@/modules/auth/token.service';
import { UserService } from '@/modules/user/user.service';
import { LoginResponseDto } from '@/common/dtos/login-response.dto';
import { LoginRequestDto } from '@/common/dtos/login-request.dto';
import { UserResponseDto } from '@/common/dtos/user-response.dto';
import { UserRequestDto } from '@/common/dtos/user-request.dto';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private tokenService: TokenService,
  ) {
  }

  async login(
    input: LoginRequestDto,
    context: any,
  ): Promise<LoginResponseDto> {
    const { username, password, stay_signed_in } = input;
    const user = await this.userService.findUserByUsername(username);
    // console.log('user', user);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    const periodOneDay = 1000 * 60 * 60 * 24;
    const periodOneWeek = periodOneDay * 7;
    const expiresFreshToken = stay_signed_in ? periodOneWeek : periodOneDay;
    if (user && isPasswordValid) {
      const accessToken = await this.generateAccessToken(user);
      const refreshToken = this.jwtService.sign({ id: user.id }, { expiresIn: expiresFreshToken });
      // console.log('refreshToken', refreshToken);
      // console.log('accessToken', accessToken);

      //set access token into database
      await this.userService.updateUser(user.id, { refreshToken: refreshToken });

      // set refresh token into httpOnly cookie
      const response: Response = context.res;
      response.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: expiresFreshToken,
      });

      return {
        message: 'login successful',
        accessToken: accessToken,
        role: user.role,
        name: user.name,
      };
    }
  }

  async logout(context: any): Promise<boolean> {
    const req = context.req;
    const { id } = await this.tokenService.processToken(req);
    await this.userService.updateUser(id, { refreshToken: '' });
    const response: Response = context.res;
    response.clearCookie('refreshToken',{
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    });
    return true;
  }


  async generateAccessToken(user: UserResponseDto): Promise<string> {
    let accessToken: string;
    if (process.env.NODE_ENV === 'production') {
      accessToken = this.jwtService.sign({ id: user.id }, { expiresIn: '1h' });
    } else {
      accessToken = this.jwtService.sign({ id: user.id }, { expiresIn: '30s' });
    }
    return accessToken;
  }


}