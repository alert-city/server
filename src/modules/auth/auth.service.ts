import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { TokenService } from '@/modules/auth/token.service';
import { UserService } from '@/modules/user/user.service';
import { LoginResponseDto } from '@/modules/auth/dtos/login-response.dto';
import { LoginRequestDto } from '@/modules/auth/dtos/login-request.dto';
import { UserResponseDto } from '@/modules/user/dtos/user-response.dto';
import { CustomException } from '@/common/exceptions/user.exception';
import {
  PASSWORD_NOT_MATCH,
  UPDATE_ERROR,
  USER_NOT_FOUND,
} from '@/common/constants/code';
import { UserUtilsService } from '@/modules/user/user-utils.service';


@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly userUtilsService: UserUtilsService,
  ) {
  }

  async login(
    input: LoginRequestDto,
  ): Promise<LoginResponseDto> {
    const { username, password, isStaySignedIn } = input;
    const user = await this.userService.findUserByUsername(username);
    if (!user) {
      throw new CustomException('User not found', 'USER_NOT_FOUND', USER_NOT_FOUND);
    }
    const isPasswordValid = await this.userUtilsService.comparePassword(password, user.password);
    const periodOneDay = 1000 * 60 * 60 * 24;
    const periodOneWeek = periodOneDay * 7;
    const expiresFreshToken = isStaySignedIn ? periodOneWeek : periodOneDay;
    if (user && isPasswordValid) {
      const accessToken = await this.generateAccessToken(user);
      const refreshToken = this.jwtService.sign({ id: user.id }, { expiresIn: expiresFreshToken });

      //set refresh token into database
      await this.userService.updateUser(user.id, { refreshToken });

      return {
        id: user.id,
        accessToken,
        name: user.name,
        role: user.role,
        accountType: user.accountType,
        organization: user.organization,
        username: user.username,
      };
    } else if (!isPasswordValid) {
      throw new CustomException('Password not match', 'PASSWORD_NOT_MATCH', PASSWORD_NOT_MATCH);
    }
  }

  async generateAccessToken(user: UserResponseDto): Promise<string> {
    let accessToken: string;
    accessToken = this.jwtService.sign({ id: user.id }, { expiresIn: '1h' });
    //set access token into database
    await this.userService.updateUser(user.id, { accessToken, verificationInfo: null });
    return accessToken;
  }

  async revokeTokens(context: any): Promise<boolean> {
    const req = context.req;
    const { id } = await this.tokenService.processToken(req);
    const updatedUser = await this.userService.updateUser(id, { refreshToken: '', accessToken: '' });
    if (!updatedUser) {
      throw new CustomException('Update user failed', 'UPDATE_ERROR', UPDATE_ERROR);
    }
    return true;
  }


}