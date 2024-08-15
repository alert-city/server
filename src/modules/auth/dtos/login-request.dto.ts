import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

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
  isStaySignedIn: boolean
}