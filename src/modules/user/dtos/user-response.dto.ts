import { Field, ObjectType, ID} from '@nestjs/graphql';
import { UserNameResponseDto } from '@/modules/user/dtos/user-name.dto';
import { IsNumber } from 'class-validator';

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

  @Field(()=> UserNameResponseDto)
  name: UserNameResponseDto;

  @Field(()=> String)
  username: string;

  @Field(()=> String)
  password: string;

  @Field(()=> String)
  displayName: string;

  @Field(()=> String)
  accountType: string;

  @Field(()=> [String])
  role: string[];

  @Field(()=> [String])
  organization: string[];

  @Field(()=> [String])
  staffs: string[];

  @Field(()=> String)
  mobilePhone: string;

  @Field(()=> String, {nullable: true})
  refreshToken?: string;

  @Field(()=> String, {nullable: true})
  accessToken?: string;

  @Field(()=> String, {nullable: true})
  avatarUrl?: string;

  @Field(()=> VerificationInfoResponseDto, {nullable: true})
  verificationInfo?: VerificationInfoResponseDto;
}