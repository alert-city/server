import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class UserRoleRequestDto {
  @IsString()
  @IsNotEmpty()
  @Field()
  userType: string;
}

@ObjectType()
export class UserRoleResponseDto {
  @Field()
  userType: string;
}