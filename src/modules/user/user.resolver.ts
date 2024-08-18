import { Args,Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserResponseDto } from '@/modules/user/dtos/user-response.dto';
import { UserRequestDto } from '@/modules/user/dtos/user-request.dto';
import { createUserSchema, updateUserSchema } from '@/validation/schemas/user/user.schema';
import { ZodValidationPipe } from '@/modules/user/pipes/zod-validation.pipe';
import { UseGuards } from '@nestjs/common';
import { CombinedAuthGuard } from '@/modules/auth/guards/combined-auth.guard';
import { UpdateUserRequestDto } from '@/modules/user/dtos/user-request.dto';
import { UserPasswordService } from '@/modules/user/user.password.service';

@Resolver()
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly userResetPasswordService: UserPasswordService,
  ) {
  }

  @Query(() => [UserResponseDto])
  @UseGuards(CombinedAuthGuard)
  async findAllUsers(): Promise<UserResponseDto[]> {
    return await this.userService.findAllUsers();
  }

  @Query(() => UserResponseDto)
  @UseGuards(CombinedAuthGuard)
  async findOneUser(@Args('id') id: string): Promise<UserResponseDto> {
    return await this.userService.findOneUser(id);
  }


  @Mutation(() => UserResponseDto)
  async createUser(@Args('input', new ZodValidationPipe(createUserSchema)) input: UserRequestDto): Promise<UserResponseDto> {
    return await this.userService.createUser(input);
  }

  @Mutation(() => UserResponseDto)
  @UseGuards(CombinedAuthGuard)
  async updateUser(
    @Args('id') id: string,
    @Args('input', new ZodValidationPipe(updateUserSchema)) input: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    return await this.userService.updateUser(id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(CombinedAuthGuard)
  async deleteUser(@Args('id') id: string): Promise<boolean> {
    return await this.userService.deleteUser(id);
  }

  @Mutation(() => Boolean)
  async sendVerificationEmail(@Args('username') username: string): Promise<boolean> {
    return await this.userResetPasswordService.sendVerificationEmail(username);
  }

  @Mutation(() => Boolean)
  async resetPassword(
    @Args('username') username: string,
    @Args('input', new ZodValidationPipe(updateUserSchema)) input: UpdateUserRequestDto,
  ): Promise<boolean> {
    return await this.userResetPasswordService.resetPassword(username, input);
  }

}