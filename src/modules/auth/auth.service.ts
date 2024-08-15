import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Injectable, NotFoundException } from '@nestjs/common';
import { TokenService } from '@/modules/auth/token.service';
import { UserService } from '@/modules/user/user.service';
import { LoginResponseDto } from '@/modules/auth/dtos/login-response.dto';
import { LoginRequestDto } from '@/modules/auth/dtos/login-request.dto';
import { UserResponseDto } from '@/modules/user/dtos/user-response.dto';
import  { UpdateFailedException } from '@/common/exceptions/update-failed.exception';

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
  ): Promise<LoginResponseDto> {
    const { username, password, isStaySignedIn } = input;
    const user = await this.userService.findUserByUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
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
    }
  }

  async generateAccessToken(user: UserResponseDto): Promise<string> {
    let accessToken: string;
    if (process.env.NODE_ENV === 'production') {
      accessToken = this.jwtService.sign({ id: user.id }, { expiresIn: '1h' });
    } else {
      accessToken = this.jwtService.sign({ id: user.id }, { expiresIn: '30s' });
    }
    //set access token into database
    await this.userService.updateUser(user.id, { accessToken });
    return accessToken;
  }

  async revokeTokens(context: any): Promise<boolean> {
    const req = context.req;
    const {id} = await this.tokenService.processToken(req);
    const updatedUser = await this.userService.updateUser(id, { refreshToken: '', accessToken: '' });
    if (!updatedUser) {
      throw new UpdateFailedException();
    }
    return true;
  }



}