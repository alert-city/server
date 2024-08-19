import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class UserNameRequestDto {
  @Field(()=> String, {nullable: true})
  firstName?: string;

  @Field(()=> String, {nullable: true})
  lastName?: string;
}

@ObjectType()
export class UserNameResponseDto {
  @Field(()=> String, {nullable: true})
  firstName?: string;

  @Field(()=> String, {nullable: true})
  lastName?: string;
}