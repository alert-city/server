import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
class LocationResponseDto {
  @Field(() => Number)
  lat: number;

  @Field(() => Number)
  lng: number;
}

@ObjectType()
class Range {
  @Field(() => LocationResponseDto)
  topLeft: LocationResponseDto;

  @Field(() => LocationResponseDto)
  topRight: LocationResponseDto;

  @Field(() => LocationResponseDto)
  bottomLeft: LocationResponseDto;

  @Field(() => LocationResponseDto)
  bottomRight: LocationResponseDto;
}

@ObjectType()
export class PersonalEventResponseDto {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  eventType: string;

  @Field(() => String)
  subject: string;

  @Field(() => String)
  matter: string;

  @Field(() => Date)
  dateTime: Date;

  @Field(() => LocationResponseDto)
  location: LocationResponseDto;

  @Field(() => String)
  submitter: string;

  @Field(() => [String], { nullable: true })
  imageUrl?: string[];

  @Field(() => String, { nullable: true })
  eventStatus?: string;

  @Field(() => Number, { nullable: true })
  activeCount?: number;

  @Field(() => Number, { nullable: true })
  inactiveCount?: number;

  @Field(() => Range, { nullable: true })
  eventRange?: Range;
}