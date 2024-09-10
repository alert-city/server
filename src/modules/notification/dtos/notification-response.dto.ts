import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EmailLinkValidationResponseDto {
  @Field(() => String)
  userId: string;

  @Field(() => String)
  activationToken: string;

  @Field(() => String)
  newUsername: string;
}

@ObjectType()
export class EmailCodeValidationResponseDto {
  @Field(() => String)
  userId: string;

  @Field(() => String)
  verificationCode: string;

  @Field(() => Date)
  expires: Date;
}
