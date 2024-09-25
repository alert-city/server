import { Resolver, Query, Mutation, Args, Subscription } from "@nestjs/graphql";
import { OrganizationEventODto, CreateEventInput, UpdateEventInput } from "@/modules/event/organization/dtos/event.o.dto";
import { OrganizationEventService } from "@/modules/event/organization/event.o.service";
import { PubSub } from "graphql-subscriptions";
import { Inject } from "@nestjs/common";

@Resolver(() => OrganizationEventODto)
export class OrganizationEventResolver {
    constructor(
        private readonly eventService: OrganizationEventService,
        @Inject('PUB_SUB') private readonly pubSub: PubSub
    ) { }

    @Query(() => [OrganizationEventODto])
    async findAllEvents(): Promise<OrganizationEventODto[]> {
        return await this.eventService.findAllEvents();
    }

    @Query(() => [OrganizationEventODto])
    async findUnreviewedEventsById(
        @Args('userId')
        userId: string,
    ): Promise<OrganizationEventODto[]> {
        return await this.eventService.findUnreviewedEventsById(userId);
    }

    @Query(() => [OrganizationEventODto])
    async findReviewedEventsById(
        @Args('userId')
        userId: string,
        @Args('approved')
        approved: boolean,
        @Args('ascending')
        ascending: boolean
    ): Promise<OrganizationEventODto[]> {
        return await this.eventService.findReviewedEventsById(userId, approved, ascending);
    }

    @Query(() => [OrganizationEventODto])
    async findUnreviewedEventsByOrgName(
        @Args('orgName')
        orgName: string
    ): Promise<OrganizationEventODto[]> {
        return await this.eventService.findUnreviewedEventsByOrgName(orgName);
    }

    @Query(() => [OrganizationEventODto])
    async findReviewedEventsByOrgName(
        @Args('orgName')
        orgName: string,
        @Args('approved')
        approved: boolean,
        @Args('ascending')
        ascending: boolean
    ): Promise<OrganizationEventODto[]> {
        return await this.eventService.findReviewedEventsByOrgName(orgName, approved, ascending);
    }

    @Mutation(() => OrganizationEventODto)
    async createEvent(
        @Args('input')
        input: CreateEventInput
    ): Promise<OrganizationEventODto> {
        return await this.eventService.createEvent(input);
    }

    @Mutation(() => OrganizationEventODto)
    async updateEvent(
        @Args('input')
        input: UpdateEventInput
    ): Promise<OrganizationEventODto> {
        return await this.eventService.updateEvent(input);
    }

    @Subscription(() => OrganizationEventODto)
    eventCreated() {
        return this.pubSub.asyncIterator('eventCreated');
    }

    @Subscription(() => OrganizationEventODto)
    eventUpdated() {
        return this.pubSub.asyncIterator('eventUpdated');
    }
}