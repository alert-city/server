import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import {OrganizationEventODto, CreateEventInput} from "./dtos/event.o.dto";
import { OrganizationEventService } from "./services/event.o.service";

@Resolver(() => OrganizationEventODto)
export class OrganizationEventResolver {
    constructor(
        private readonly eventService: OrganizationEventService
    ) {}

    @Query(() => [OrganizationEventODto])
    async findAllOrgEvents(): Promise<OrganizationEventODto[]> {
        return await this.eventService.findAllEvents();
    }

    @Query(() => [OrganizationEventODto])
    async findOrgEventsByType(@Args('eventType') eventType: string): Promise<OrganizationEventODto[]> {
        return await this.eventService.findEventsByType(eventType);
    }

    @Query(() => [OrganizationEventODto])
    async findOrgEventsByDate(@Args('date_') date_: string): Promise<OrganizationEventODto[]> {
        return await this.eventService.findEventsByDate(date_);
    }

    @Query(() => [OrganizationEventODto])
    async findOrgEventsBySubmitter(@Args('submitter') submitter: string): Promise<OrganizationEventODto[]> {
        return await this.eventService.findEventsBySubmitter(submitter);
    }

    @Query(() => [OrganizationEventODto])
    async findOrgEventsByOrgName(@Args('orgName') orgName: string): Promise<OrganizationEventODto[]> {
        return await this.eventService.findEventsByOrgName(orgName);
    }

    @Mutation(() => OrganizationEventODto)
    async createOrgEvent(
        @Args('input')
        input: CreateEventInput
    ): Promise<OrganizationEventODto> {
        return await this.eventService.createEvent(input);
    }
}