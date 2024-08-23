import { Field, ObjectType, ID} from '@nestjs/graphql';
import { UserNameResponseDto } from '@/modules/user/dtos/user-name.dto';


@ObjectType()
export class UserResponseDto {
  @Field(()=> ID)
  id: string;

  @Field(()=> UserNameResponseDto, {nullable: true})
  name?: UserNameResponseDto;

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
  mobilePhone: string;

  @Field(()=> String, {nullable: true})
  refreshToken?: string;

  @Field(()=> String, {nullable: true})
  accessToken?: string;

  @Field(()=> String, {nullable: true})
  avatarUrl?: string;

  @Field(()=> Boolean)
  is2FAEnabled: boolean;

  @Field(()=> String)
  twoFASecret: string;

  @Field(()=> Boolean, {nullable: true})
  isAccountActivated?: boolean;
}

@ObjectType()
export class AccountActivationResponseDto {
  @Field(()=> String)
  userId: string;

  @Field(()=> String)
  activationToken: string;
}

@ObjectType()
export class PasswordResetResponseDto {
  @Field(()=> String)
  userId: string;

  @Field(()=> String)
  verificationCode: string;

  @Field(()=> Date)
  expires: Date;
}