import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import {EventDto, CreateEventInput} from "./dtos/event.dto";
import { EventService } from "./services/event.service";
import { createEventSchema } from "@/validation/schemas/event/event.schema";

@Resolver(() => EventDto)
export class EventResolver {
    constructor(
        private readonly eventService: EventService
    ) {}

    @Query(() => [EventDto])
    async findAllEvents(): Promise<EventDto[]> {
        return await this.eventService.findAllEvents();
    }

    @Query(() => [EventDto])
    async findEventsByType(@Args('eventType') eventType: string): Promise<EventDto[]> {
        return await this.eventService.findEventsByType(eventType);
    }

    @Query(() => [EventDto])
    async findEventsByDate(@Args('date_') date_: string): Promise<EventDto[]> {
        return await this.eventService.findEventsByDate(date_);
    }

    @Query(() => [EventDto])
    async findEventsBySubmitter(@Args('submitter') submitter: string): Promise<EventDto[]> {
        return await this.eventService.findEventsBySubmitter(submitter);
    }

    @Query(() => [EventDto])
    async findEventsByOrgName(@Args('orgName') orgName: string): Promise<EventDto[]> {
        return await this.eventService.findEventsByOrgName(orgName);
    }

    @Mutation(() => EventDto)
    async createEvent(
        @Args('input')
        input: CreateEventInput
    ): Promise<EventDto> {
        return await this.eventService.createEvent(input);
    }
}