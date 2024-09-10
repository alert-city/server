import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SendUpdateUsernameEmailRequestDto {
  @Field(() => String)
  newUsername: string;
}
