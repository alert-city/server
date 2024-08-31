import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SendVerificationEmailDto {
  @Field(() => String)
  username: string;

  @Field(() => Number)
  emailInfoType: number;
}

@InputType()
export class SendUpdateUsernameEmailRequestDto {
  @Field(() => String)
  newUsername: string;

  @Field(() => Number)
  emailInfoType: number;
}