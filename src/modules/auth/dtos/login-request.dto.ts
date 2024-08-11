import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsMobilePhone, IsEmail } from 'class-validator';
import { UserNameRequestDto } from '../../user/dtos/user-name.dto';
import { UserRoleRequestDto } from '../../user/dtos/user-usertype.dto';

@InputType()
export class LoginRequestDto {
  // @IsString()
  @IsNotEmpty()
  @IsEmail()
  @Field(() => String)
  username: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  password: string;

  @IsNotEmpty()
  @Field(() => Boolean)
  stay_signed_in: boolean
}