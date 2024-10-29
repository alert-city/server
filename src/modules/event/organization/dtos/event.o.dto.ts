import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { UserResponseDto } from '@/modules/user/dtos/user-response.dto';

@ObjectType()
export class OrganizationEventODto {
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

    @Field(() => UserResponseDto)
    submitter: UserResponseDto;

    @Field(() => String, {nullable: true})
    orgName?: string;

    @Field(() => Boolean)
    isReviewed: boolean;

    @Field(() => Boolean, {nullable: true})
    isApproved?: boolean;

    @Field(() => String, {nullable: true})
    reviewComment?: string;
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

    @Field(() => Boolean)
    isReviewed: boolean;

    @Field(() => Boolean, {nullable: true})
    isApproved?: boolean;

    @Field(() => String, {nullable: true})
    reviewComment?: string;
};

@InputType()
export class UpdateEventInput {
    @Field(() => String)
    id: string;

    @Field(() => Boolean)
    isReviewed: boolean;

    @Field(() => Boolean, {nullable: true})
    isApproved?: boolean;

    @Field(() => String, {nullable: true})
    reviewComment?: string;
}