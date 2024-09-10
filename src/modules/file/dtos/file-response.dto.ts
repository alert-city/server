import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UploadFileResponseDto {
  @Field(() => String)
  fileId: string;

  @Field(() => String)
  fileUrl: string;

  @Field(() => String)
  filename: string;
}
