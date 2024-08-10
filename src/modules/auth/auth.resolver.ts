import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { LoginResponseDto } from '@/common/dtos/login-response.dto';
import { LoginRequestDto } from '@/common/dtos/login-request.dto';
import { AuthService } from './auth.service';

@Resolver()
// @UseGuards(JwtAuthGuard)
export class AuthResolver {
  constructor(
  private readonly authService: AuthService,
  ) {}

  @Mutation(() => LoginResponseDto)
  async login(
  @Args('input') input: LoginRequestDto,
  @Context() context: any
  ): Promise<LoginResponseDto> {
    return await this.authService.login(input, context);
  }

  @Mutation(() => Boolean )
  async logout(@Context() context: any):Promise<boolean>{
  return await this.authService.logout(context);
  }


}