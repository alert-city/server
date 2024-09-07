/* eslint-disable prettier/prettier */
import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EventDto {
    @Field(() => ID)
    id: string;

    @Field(() => String)
    eventType: string;

    @Field(() => String)
    date: string;

    @Field(() => String)
    time: string;

    @Field(() => String, {nullable: true})
    location?: string;

    @Field(() => String)
    subject: string;

    @Field(() => String)
    matter: string;

    @Field(() => String, {nullable: true})
    ERTime?: string;

    @Field(() => String, {nullable: true})
    ERDate?: string;

    @Field(() => String)
    submitter: string;

    @Field(() => String, {nullable: true})
    orgName?: string;
};

@InputType()
export class CreateEventInput {
    @Field(() => String)
    eventType: string;

    @Field(() => String)
    date: string;

    @Field(() => String)
    time: string;

    @Field(() => String, {nullable: true})
    location?: string;

    @Field(() => String)
    subject: string;

    @Field(() => String)
    matter: string;

    @Field(() => String, {nullable: true})
    ERTime?: string;

    @Field(() => String, {nullable: true})
    ERDate?: string;

    @Field(() => String)
    submitter: string;

    @Field(() => String, {nullable: true})
    orgName?: string;
};