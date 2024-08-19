import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserResponseDto } from '@/modules/user/dtos/user-response.dto';
import { UserNameResponseDto } from '@/modules/user/dtos/user-name.dto';

@ObjectType()
export class LoginResponseDto {
  @Field(()=> ID, )
  id: string;

  @Field(()=> UserNameResponseDto, {nullable: true})
  name?: UserNameResponseDto;

  @Field(()=> String, {nullable: true})
  orgName?: string;

  @Field(()=> String, {nullable: true})
  username?: string;

  @Field(()=> String)
  accountType: string;

  @Field(()=> [String])
  role: string[];

  @Field(()=> [String], {nullable: true})
  organization?: string[];

  @Field(()=> [String], {nullable: true})
  staffs?: string[];

  @Field(()=> String, {nullable: true})
  mobilePhone?: string;

  @Field(()=> String, {nullable: true})
  accessToken: string;
}