import { Field, ObjectType} from '@nestjs/graphql';

@ObjectType()
class Name {
  @Field(()=> String)
  firstName: string;

  @Field(()=> String)
  lastName: string;
}

@ObjectType()
export class LoginResponseDto {
  @Field(()=> String)
  message: string;

  @Field(()=> String, )
  accessToken: string;

  @Field(()=> String)
  role: string;

  @Field(()=> Name)
  name: Name;
}