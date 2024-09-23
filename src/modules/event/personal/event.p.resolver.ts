import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { PersonalEventResponseDto } from './dtos/event.p.dto.response';
import { PersonalEventService } from './event.p.service';
import { PersonalEventRequestDto } from './dtos/event.p.dto.request';


@Resolver()
export class PersonalEventResolver {
  constructor(
    private readonly eventService: PersonalEventService,
  ) {
  }

  @Query(() => [PersonalEventResponseDto])
  async findAllPsnEvents(): Promise<PersonalEventResponseDto[]> {
    return await this.eventService.findAllPsnEvents();
  }

  @Mutation(() => PersonalEventResponseDto)
  async createPsnEvent(@Args('input') input: PersonalEventRequestDto): Promise<PersonalEventResponseDto> {
    return await this.eventService.createPsnEvent(input);
  }



}