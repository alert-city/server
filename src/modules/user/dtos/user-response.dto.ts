import { Field, ObjectType, ID} from '@nestjs/graphql';
import { UserNameResponseDto } from '@/modules/user/dtos/user-name.dto';

@ObjectType()
class VerificationInfoResponseDto {
  @Field(()=> String)
  code: string;

  @Field(()=> Date)
  expires: Date;
}


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

  @Field(()=> String)
  avatarUrl: string;

  @Field(()=> VerificationInfoResponseDto, {nullable: true})
  verificationInfo?: VerificationInfoResponseDto;
}