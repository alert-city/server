import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class UserNameRequestDto {
  @IsString()
  @IsNotEmpty()
  @Field()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  lastName: string;
}

@ObjectType()
export class UserNameResponseDto {
  @Field()
  firstName: string;

  @Field()
  lastName: string;
}