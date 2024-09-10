import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class LoginRequestDto {
  @Field(() => String)
  username: string;

  @Field(() => String)
  password: string;

  @Field(() => Boolean)
  isStaySignedIn: boolean;
}

@InputType()
export class OAuthLoginRequestDto {
  @Field(() => String)
  username: string;

  @Field(() => String)
  OAuthProvider: string;

  @Field(() => String)
  providerId: string;

  @Field(() => String)
  accessToken: string;

  @Field(() => String, { nullable: true })
  firstName?: string;

  @Field(() => String, { nullable: true })
  lastName?: string;

  @Field(() => String, { nullable: true })
  avatarUrl?: string;

  @Field(() => Boolean)
  isStaySignedIn: boolean;

  @Field(() => String)
  displayName: string;

  @Field(() => String)
  accountType: string;

  @Field(() => [String])
  role: string[];
}
