import { Field, InputType } from '@nestjs/graphql';

@InputType()
class BaseUserRequestDto {
  @Field(() => String, { nullable: true })
  firstName?: string;

  @Field(() => String, { nullable: true })
  lastName?: string;

  @Field(() => String, { nullable: true })
  orgName?: string;

  @Field(() => String, { nullable: true })
  username?: string;

  @Field(() => String, { nullable: true })
  password?: string;

  @Field(() => String, { nullable: true })
  confirmPassword?: string;

  @Field(() => String, { nullable: true })
  displayName?: string;

  @Field(() => String, { nullable: true })
  accountType?: string;

  @Field(() => [String], { nullable: true })
  role?: string[];

  @Field(() => [String], { nullable: true })
  organization?: [string];

  @Field(() => [String], { nullable: true })
  staffs?: [string];

  @Field(() => String, { nullable: true })
  phoneNumber?: string;

  @Field(() => String, { nullable: true })
  verificationCode?: string;

  @Field(() => Boolean, { nullable: true })
  is2FAEnabled?: boolean;

  @Field(() => String, { nullable: true })
  twoFASecret?: string;
}

@InputType()
export class UserRequestDto extends BaseUserRequestDto {
  @Field(() => String)
  username: string;

  @Field(() => String)
  password: string;

  @Field(() => String)
  displayName: string;

  @Field(() => String)
  accountType: string;

  @Field(() => [String])
  role: string[];

  @Field(() => String)
  phoneNumber: string;

  @Field(() => Number)
  emailInfoType: number;

  @Field(() => String)
  captchaToken: string;
}

@InputType()
export class UpdateUserRequestDto extends BaseUserRequestDto {
  @Field(() => String, { nullable: true })
  username?: string;

  @Field(() => String, { nullable: true })
  refreshToken?: string;

  @Field(() => String, { nullable: true })
  accessToken?: string;

  @Field(() => String, { nullable: true })
  avatarUrl?: string;

  @Field(() => Boolean, { nullable: true })
  is2FAEnabled?: boolean;

  @Field(() => String, { nullable: true })
  twoFASecret?: string;

  @Field(() => Boolean, { nullable: true })
  isAccountActivated?: boolean;

  @Field(() => String, { nullable: true })
  verificationCode?: string;

  @Field(() => Boolean, { nullable: true })
  isFirstLogin?: boolean;
}

@InputType()
export class ResetPasswordRequestDto {
  @Field(() => String)
  verificationCode: string;

  @Field(() => String)
  password: string;

  @Field(() => String)
  confirmPassword: string;
}
