import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsMobilePhone, IsEmail, IsNumber } from 'class-validator';
import { UserNameRequestDto } from './user-name.dto';

@InputType()
export class VerificationInfoRequestDto {
  @IsString()
  @Field(() => String)
  code: string;

  @IsString()
  @Field(() => Date)
  expires: Date;
}


@InputType()
class BaseUserRequestDto {
  @IsString()
  @Field(() => UserNameRequestDto, { nullable: true })
  name?: UserNameRequestDto;

  @IsEmail()
  @Field(() => String, { nullable: true })
  username?: string;

  @IsString()
  @Field(() => String, { nullable: true })
  password?: string;

  @IsString()
  @Field(() => String, { nullable: true })
  displayName?: string;

  @IsString()
  @Field(() => String, { nullable: true })
  accountType?: string;

  @IsString()
  @Field(() => [String], { nullable: true })
  role?: string[];

  @IsString()
  @Field(() => [String], { nullable: true })
  organization?: [string];

  @IsString()
  @Field(() => [String], { nullable: true })
  staffs?: [string];

  @IsMobilePhone()
  @Field(() => String, { nullable: true })
  mobilePhone?: string;

  @IsString()
  @Field(() =>String, { nullable: true })
  verificationCode?: string;
}

@InputType()
export class UserRequestDto extends BaseUserRequestDto {
  @IsNotEmpty()
  @Field(() => UserNameRequestDto)
  name: UserNameRequestDto;

  @IsNotEmpty()
  @IsEmail()
  @Field(() => String)
  username: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  password: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  displayName: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  accountType: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => [String])
  role: string[];

  @IsString()
  @Field(() => [String], { nullable: true })
  organization?: [string];

  @IsString()
  @Field(() => [String], { nullable: true })
  staffs?: [string];

  @IsNotEmpty()
  @IsMobilePhone()
  @Field(() => String)
  mobilePhone: string;
}

@InputType()
export class UpdateUserRequestDto extends BaseUserRequestDto {
  @IsString()
  @Field(() => String, { nullable: true })
  refreshToken?: string;

  @IsString()
  @Field(() => String, { nullable: true })
  accessToken?: string;

  @IsString()
  @Field(() => String, { nullable: true })
  avatarUrl?: string;

  @IsString()
  @Field(() =>VerificationInfoRequestDto, { nullable: true })
  verificationInfo?: VerificationInfoRequestDto;
}