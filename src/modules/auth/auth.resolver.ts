import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import {
  OAuthLoginRequestDto,
  LoginRequestDto,
} from '@/modules/auth/dtos/login-request.dto';
import { AuthService } from './auth.service';
import { TwoFADto } from '@/modules/auth/dtos/login-response.dto';
import { UseGuards } from '@nestjs/common';
import { CombinedAuthGuard } from '@/modules/auth/guards/combined-auth.guard';
import { UserResponseDto } from '@/modules/user/dtos/user-response.dto';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => UserResponseDto)
  async login(@Args('input') input: LoginRequestDto): Promise<UserResponseDto> {
    return await this.authService.login(input);
  }

  @Mutation(() => UserResponseDto)
  async OAuthLogin(
    @Args('input') input: OAuthLoginRequestDto,
  ): Promise<UserResponseDto> {
    return await this.authService.OAuthLogin(input);
  }

  @Mutation(() => Boolean)
  async revokeTokens(@Context() context: any): Promise<boolean> {
    return await this.authService.revokeTokens(context);
  }

  @Mutation(() => TwoFADto)
  @UseGuards(CombinedAuthGuard)
  async generate2FA(
    @Args('issuer') issuer: string,
    @Args('id') id: string,
  ): Promise<TwoFADto> {
    return await this.authService.generate2FA(issuer, id);
  }

  @Mutation(() => Boolean)
  @UseGuards(CombinedAuthGuard)
  async verify2FACode(
    @Args('id') id: string,
    @Args('code') code: string,
  ): Promise<boolean> {
    return await this.authService.verify2FACode(id, code);
  }
}
