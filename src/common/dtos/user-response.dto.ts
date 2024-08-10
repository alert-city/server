import { Field, ObjectType, ID} from '@nestjs/graphql';
import { UserNameResponseDto } from '@/common/dtos/user-name.dto';
import { UserRoleResponseDto  } from '@/common/dtos/user-usertype.dto';


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
  role: string;

  @Field(()=> String)
  mobilePhone: string;

  @Field(()=> String, {nullable: true})
  refreshToken: string;
}