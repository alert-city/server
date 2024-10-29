import { Args, Mutation, Query, Resolver, Int, Context,Subscription } from '@nestjs/graphql';
import { UserService } from './services/user.service';
import { UserResponseDto } from '@/modules/user/dtos/user-response.dto';
import {
  ResetPasswordRequestDto,
  UserRequestDto,
} from '@/modules/user/dtos/user-request.dto';
import { UseGuards } from '@nestjs/common';
import { CombinedAuthGuard } from '@/modules/auth/guards/combined-auth.guard';
import { UpdateUserRequestDto } from '@/modules/user/dtos/user-request.dto';
import { UserPasswordService } from '@/modules/user/services/user.password.service';
import { SendUpdateUsernameEmailRequestDto } from '@/modules/notification/dtos/notification-request.dto';
import { PubSub } from 'graphql-subscriptions';
import { Inject } from '@nestjs/common';

@Resolver()
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly userResetPasswordService: UserPasswordService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
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
  async findUserByUsername(
    @Args('username') username: string,
  ): Promise<UserResponseDto> {
    return await this.userService.findUserByUsername(username);
  }

  @Mutation(() => UserResponseDto)
  async createUser(
    @Args('input') input: UserRequestDto,
    @Args('platform') platform: string,
  ): Promise<UserResponseDto> {
    return await this.userService.createUser(input, platform);
  }

  @Mutation(() => UserResponseDto)
  @UseGuards(CombinedAuthGuard)
  async updateUser(
    @Args('id') id: string,
    @Args('input') input: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    return await this.userService.updateUser(id, input);
  }

  @Subscription(()=> UserResponseDto)
  userUpdated() {
    console.log("userUpdated subscribed");
    return this.pubSub.asyncIterator('userUpdated');
  }

  @Mutation(() => Boolean)
  @UseGuards(CombinedAuthGuard)
  async deleteUser(@Args('id') id: string): Promise<boolean> {
    return await this.userService.deleteUser(id);
  }

  @Mutation(() => Boolean)
  async sendVerificationCodeEmail(
    @Args('username') username: string,
    @Args('emailInfoType', { type: () => Int }) emailInfoType: number,
  ): Promise<boolean> {
    return await this.userService.sendVerificationCodeEmail(
      username,
      emailInfoType,
    );
  }

  @Mutation(() => Boolean)
  async resetPassword(
    @Args('username') username: string,
    @Args('input') input: ResetPasswordRequestDto,
  ): Promise<boolean> {
    return await this.userResetPasswordService.resetPassword(username, input);
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
    @Args('id') id: string,
    @Args('emailInfoType', { type: () => Int }) emailInfoType: number,
    @Args('newUsername', { nullable: true }) newUsername?: string,
  ): Promise<boolean> {
    return await this.userService.resendActivationLinkEmail({
      id,
      emailInfoType,
      newUsername,
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(CombinedAuthGuard)
  async sendUpdateUsernameEmail(
    @Args('id') id: string,
    @Args('input') input: SendUpdateUsernameEmailRequestDto,
  ): Promise<boolean> {
    return await this.userService.sendUpdateUsernameEmail(id, input);
  }
}
