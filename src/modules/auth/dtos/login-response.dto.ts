import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TwoFADto {
  @Field(() => String)
  secret: string;

  @Field(() => String)
  qrCodeUrl: string;
}
