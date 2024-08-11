import { Args, Context, GqlExecutionContext, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserResponseDto } from '@/modules/user/dtos/user-response.dto';
import { UserRequestDto } from '@/modules/user/dtos/user-request.dto';
import { createUserSchema, updateUserSchema } from '@/validation/schemas/user/user.schema';
import { ZodValidationInterceptor } from '@/modules/user/Interceptors/user-validation.interceptor';
import { UseInterceptors, UseGuards } from '@nestjs/common';
import { CombinedAuthGuard } from '@/modules/auth/guards/combined-auth.guard';
import { UpdateUserRequestDto } from '@/modules/user/dtos/user-request.dto';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {
  }

  @Query(() => [UserResponseDto])
  async findAllUsers(): Promise<UserResponseDto[]> {
    return await this.userService.findAllUsers();
  }

  @Query(() => UserResponseDto)
  @UseGuards(CombinedAuthGuard)
  async findOneUser(@Args('id') id: string): Promise<UserResponseDto> {
    return await this.userService.findOneUser(id);
  }


  @Mutation(() => UserResponseDto)
  @UseInterceptors(new ZodValidationInterceptor(createUserSchema))
  async createUser(@Args('input') input: UserRequestDto): Promise<UserResponseDto> {
    return await this.userService.createUser(input);
  }

  @Mutation(() => UserResponseDto)
  // @UseGuards(CombinedAuthGuard)
  @UseInterceptors(new ZodValidationInterceptor(updateUserSchema))
  async updateUser(
    @Args('id') id: string,
    @Args('input') input: UpdateUserRequestDto): Promise<UserResponseDto> {
    return await this.userService.updateUser(id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(CombinedAuthGuard)
  async deleteUser(@Args('id') id: string): Promise<boolean> {
    return await this.userService.deleteUser(id);
  }
}