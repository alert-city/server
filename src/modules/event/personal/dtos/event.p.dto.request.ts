import { Field, InputType} from '@nestjs/graphql';

@InputType()
class LocationRequestDto {
  @Field(() => Number)
  lat: number;

  @Field(() => Number)
  lng: number;
}

@InputType()
export class PersonalEventRequestDto {
  @Field(() => String)
  eventType: string;

  @Field(() => String)
  subject: string;

  @Field(() => String)
  matter: string;

  @Field(() => Date)
  dateTime: Date;

  @Field(() => LocationRequestDto)
  location: LocationRequestDto;

  @Field(() => String)
  submitter: string;

  @Field(() => [String], {nullable: true})
  imageUrl?: string[];
}