import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { LoginResponseDto } from '@/modules/auth/dtos/login-response.dto';
import { LoginRequestDto } from '@/modules/auth/dtos/login-request.dto';
import { AuthService } from './auth.service';
import { loginSchema } from '@/validation/schemas/login/login.schema';
import { ZodValidationPipe } from '@/modules/user/pipes/zod-validation.pipe';

@Resolver()
export class AuthResolver {
  constructor(
  private readonly authService: AuthService,
  ) {}

  @Mutation(() => LoginResponseDto)
  async login(
  @Args('input', new ZodValidationPipe(loginSchema)) input: LoginRequestDto,
  ): Promise<LoginResponseDto> {
    return await this.authService.login(input);
  }

  @Mutation(() => Boolean )
  async revokeTokens(@Context() context: any):Promise<boolean>{
  return await this.authService.revokeTokens(context);
  }
}