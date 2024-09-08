import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LoginResponseDto {
  @Field(()=> ID, )
  id: string;

  @Field(() => String, {nullable: true})
  firstName?: string;

  @Field(() => String, {nullable: true})
  lastName?: string;

  @Field(()=> String, {nullable: true})
  orgName?: string;

  @Field(()=> String)
  username: string;

  @Field(()=> String, {nullable: true})
  avatarUrl?: string;

  @Field(()=> String)
  accountType: string;

  @Field(()=> [String])
  role: string[];

  @Field(()=> [String], {nullable: true})
  organization?: string[];

  @Field(()=> [String], {nullable: true})
  staffs?: string[];

  @Field(()=> String, {nullable: true})
  phoneNumber?: string;

  @Field(()=> String, {nullable: true})
  accessToken: string;

  @Field(()=> String, {nullable: true})
  displayName?: string;

  @Field(()=> Boolean, {nullable: true})
  isFirstLogin?: boolean;
}

@ObjectType()
export class TwoFADto {
  @Field(()=> String)
  secret: string;

  @Field(()=> String)
  qrCodeUrl: string;
}