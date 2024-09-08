import { Field, ObjectType, ID} from '@nestjs/graphql';

@ObjectType()
export class UserResponseDto {
  @Field(()=> ID)
  id: string;

  @Field(() => String, {nullable: true})
  firstName?: string;

  @Field(() => String, {nullable: true})
  lastName?: string;

  @Field(() => String, {nullable: true})
  orgName?: string;

  @Field(()=> String)
  username: string;

  @Field(()=> String, {nullable: true})
  password?: string;

  @Field(()=> String)
  displayName: string;

  @Field(()=> String)
  accountType: string;

  @Field(()=> [String])
  role: string[];

  @Field(()=> [String], {nullable: true})
  organization?: string[];

  @Field(()=> [String], {nullable: true})
  staffs?: string[];

  @Field(()=> String)
  phoneNumber: string;

  @Field(()=> String, {nullable: true})
  refreshToken?: string;

  @Field(()=> String, {nullable: true})
  accessToken?: string;

  @Field(()=> String, {nullable: true})
  avatarUrl?: string;

  @Field(()=> Boolean, {nullable: true})
  is2FAEnabled?: boolean;

  @Field(()=> String, {nullable: true})
  twoFASecret?: string;

  @Field(()=> Boolean, {nullable: true})
  isAccountActivated?: boolean;

  @Field(()=> Boolean, {nullable: true})
  isFirstLogin?: boolean;
}

