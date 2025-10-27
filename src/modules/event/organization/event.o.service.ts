import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  OrganizationEventODto,
  CreateEventInput,
  UpdateEventInput,
} from '@/modules/event/organization/dtos/event.o.dto';
import { ErrorContext } from '@/common/adjustment-strategies/error-context';
import { I18nService } from '@/modules/i18n/i18n.service';
import { UnifiedErrorStrategyImpl } from '@/common/adjustment-strategies/unified-error.strategy';
import { PubSub } from 'graphql-subscriptions';

@Injectable()
export class OrganizationEventService {
  private readonly errorContext: ErrorContext;

  constructor(
    @InjectModel('Event')
    private readonly eventModel: Model<OrganizationEventODto>,
    private readonly unifiedErrorStrategy: UnifiedErrorStrategyImpl,
    private readonly i18nService: I18nService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {
    this.errorContext = new ErrorContext(this.unifiedErrorStrategy);
  }

  // Queries

  private t(key: string): string {
    return this.i18nService.getTranslation(key);
  }

  async findAllEvents(): Promise<OrganizationEventODto[]> {
    const allEvents = await this.eventModel.find();
    return allEvents;
  }

  async findUnreviewedEventsById(
    userId: string,
  ): Promise<OrganizationEventODto[]> {
    const allEvents = await this.eventModel
      .find({
        submitter: userId,
        isReviewed: false,
      })
      .sort({
        createdAt: 1,
      })
      .exec();
    return allEvents;
  }

  async findReviewedEventsById(
    userId: string,
    approved: boolean,
    ascending: boolean,
  ): Promise<OrganizationEventODto[]> {
    const allEvents = await this.eventModel
      .find({
        submitter: userId,
        isReviewed: true,
        isApproved: approved,
      })
      .sort({
        updatedAt: ascending ? 1 : -1,
      })
      .exec();
    return allEvents;
  }

  async findUnreviewedEventsByOrgName(
    orgName: string,
  ): Promise<OrganizationEventODto[]> {
    const allEvents = await this.eventModel
      .find({
        orgName: orgName,
        isReviewed: false,
      })
      .populate('submitter', 'firstName lastName')
      .sort({
        createdAt: 1,
      })
      .exec();
    return allEvents;
  }

  async findReviewedEventsByOrgName(
    orgName: string,
    approved: boolean,
    ascending: boolean,
  ): Promise<OrganizationEventODto[]> {
    const allEvents = await this.eventModel
      .find({
        orgName: orgName,
        isReviewed: true,
        isApproved: approved,
      })
      .populate('submitter', 'firstName lastName')
      .sort({
        updatedAt: ascending ? 1 : -1,
      })
      .exec();
    return allEvents;
  }

  // Mutations

  async createEvent(input: CreateEventInput): Promise<OrganizationEventODto> {
    try {
      const newEvent = await this.eventModel.create(input);
      if (!newEvent) {
        await this.errorContext.execute({
          type: 'DIRECT_THROW',
          message: this.t('createEventError'),
        });
        return null;
      }
      await this.pubSub.publish('eventCreated', { eventCreated: newEvent });
      return newEvent;
    } catch (error) {
      console.error('Error creating event: ', error);
      throw new Error(this.t('createEventError'));
    }
  }

  async updateEvent(input: UpdateEventInput): Promise<OrganizationEventODto> {
    try {
      const updatedEvent = await this.eventModel
        .findByIdAndUpdate(
          input.id,
          {
            isReviewed: input.isReviewed,
            isApproved: input.isApproved,
            reviewComment: input.reviewComment,
          },
          { new: true },
        )
        .populate('submitter', 'firstName lastName')
        .exec();
      if (!updatedEvent) {
        await this.errorContext.execute({
          type: 'DIRECT_THROW',
          message: this.t('updateEventError'),
        });
        return null;
      }
      await this.pubSub.publish('eventUpdated', { eventUpdated: updatedEvent });
      return updatedEvent;
    } catch {
      Error;
    }
    {
      console.error('Error updating event: ', Error);
      throw new Error(this.t('updateEventError'));
    }
  }
}
