import { Args, Mutation, Query, Resolver, Int } from '@nestjs/graphql';
import { UserService } from './services/user.service';
import { UserResponseDto } from '@/modules/user/dtos/user-response.dto';
import { UserRequestDto } from '@/modules/user/dtos/user-request.dto';
import { SendVerificationEmailDto } from '@/modules/notification/dtos/notification-request.dto';
import { createUserSchema, updateUserSchema } from '@/validation/schemas/user/user.schema';
import { getCodeSchema, resetPasswordSchema } from '@/validation/schemas/reset-password/reset-password.schema';
import { ZodValidationPipe } from '@/modules/user/pipes/zod-validation.pipe';
import { UseGuards } from '@nestjs/common';
import { CombinedAuthGuard } from '@/modules/auth/guards/combined-auth.guard';
import { UpdateUserRequestDto } from '@/modules/user/dtos/user-request.dto';
import { UserPasswordService } from '@/modules/user/services/user.password.service';
import { updateUsernameSchema } from '@/validation/schemas/update-profile/update-profile.schema';
import { SendUpdateUsernameEmailRequestDto } from '@/modules/notification/dtos/notification-request.dto';

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

  @Query(() => UserResponseDto)
  @UseGuards(CombinedAuthGuard)
  async findUserByUsername(@Args('username') username: string): Promise<UserResponseDto> {
    return await this.userService.findUserByUsername(username);
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
  async sendVerificationCodeEmail(
    @Args('input', new ZodValidationPipe(getCodeSchema)) input: SendVerificationEmailDto,
  ): Promise<boolean> {
    const { username, emailInfoType } = input;
    return await this.userService.sendVerificationCodeEmail(username, emailInfoType);
  }

  @Mutation(() => Boolean)
  async resetPassword(
    @Args('username') username: string,
    @Args('input', new ZodValidationPipe(resetPasswordSchema)) input: UpdateUserRequestDto,
  ): Promise<boolean> {
    return await this.userResetPasswordService.resetPassword(username, input);
  }

  @Mutation(() => UserResponseDto)
  // @UseGuards(CombinedAuthGuard)
  async updateUserByUsername(
    @Args('username') username: string,
    @Args('input', new ZodValidationPipe(updateUserSchema)) input: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    return await this.userService.updateUserByUsername(username, input);
  }

  @Mutation(() => Boolean)
  async validateEmailLink(
    @Args('token') token: string,
    @Args('emailInfoType', { type: () => Int }) emailInfoType: number,
  ): Promise<boolean> {
    return await this.userService.validateEmailLink(token, emailInfoType);
  }

  @Mutation(() => Boolean)
  async resendActivationLinkEmail(
  @Args('username') username: string,
  @Args('emailInfoType', { type: () => Int }) emailInfoType: number,
  @Args('newUsername', { nullable: true }) newUsername?: string,
  ): Promise<boolean> {
    return await this.userService.resendActivationLinkEmail(username, emailInfoType, newUsername);
  }

  @Mutation(() => Boolean)
  async sendUpdateUsernameEmail(
    @Args('username') username: string,
    @Args('input', new ZodValidationPipe(updateUsernameSchema)) input: SendUpdateUsernameEmailRequestDto,
  ): Promise<boolean> {
    return await this.userService.sendUpdateUsernameEmail(username, input);
  }
}