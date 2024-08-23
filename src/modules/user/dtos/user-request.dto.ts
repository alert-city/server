import { Field, InputType } from '@nestjs/graphql';
import { UserNameRequestDto } from './user-name.dto';


@InputType()
class BaseUserRequestDto {
  @Field(() => UserNameRequestDto, { nullable: true })
  name?: UserNameRequestDto;

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
  mobilePhone?: string;

  @Field(() =>String, { nullable: true })
  verificationCode?: string;

  @Field(() => Boolean, { nullable: true })
  is2FAEnabled?: boolean;
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
  mobilePhone: string;
}

@InputType()
export class UpdateUserRequestDto extends BaseUserRequestDto {
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
}

@InputType()
export class SendVerificationEmailDto {
  @Field(() => String)
  username: string;
}