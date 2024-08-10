import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsMobilePhone, IsEmail } from 'class-validator';
import { UserNameRequestDto } from './user-name.dto';
import { UserRoleRequestDto } from './user-usertype.dto';

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
  role?: string;

  @IsMobilePhone()
  @Field(() => String, { nullable: true })
  mobilePhone?: string;
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
  role: string;

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
}