import { Injectable } from "@nestjs/common";
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { EventDto, CreateEventInput } from "../dtos/event.dto";
import { ErrorContext } from '@/common/adjustment-strategies/error-context';
import { I18nService } from '@/modules/i18n/i18n.service';
import { UnifiedErrorStrategyImpl } from '@/common/adjustment-strategies/unified-error.strategy';
import { NOT_FOUND_ERROR } from "@/common/constants/code";

@Injectable()
export class EventService {
    private readonly errorContext: ErrorContext;

    constructor(
        @InjectModel('Event')
        private readonly eventModel: Model<EventDto>,
        private readonly unifiedErrorStrategy: UnifiedErrorStrategyImpl,
        private readonly i18nService: I18nService,
    ) {
        this.errorContext = new ErrorContext(this.unifiedErrorStrategy);
    }

    private t(key: string): string {
        return this.i18nService.getTranslation(key);
    }

    async findAllEvents(): Promise<EventDto[]> {
        const allEvents = await this.eventModel.find();
        await this.errorContext.execute({
            type: 'IS_ARRAY_OBJ_EMPTY',
            arrayObj: allEvents,
            message: this.t("eventsNotFound"),
            code: NOT_FOUND_ERROR
        });
        return allEvents;
    }

    async findEventsByType(eventType: string): Promise<EventDto[]> {
        const allEvents = await this.eventModel.find({
            eventType: eventType
        });
        await this.errorContext.execute({
            type: 'IS_ARRAY_OBJ_EMPTY',
            arrayObj: allEvents,
            message: this.t("eventsNotFound"),
            code: NOT_FOUND_ERROR
        });
        return allEvents;
    }

    async findEventsByDate(date_: string): Promise<EventDto[]> {
        const allEvents = await this.eventModel.find({
            date: date_
        });
        await this.errorContext.execute({
            type: 'IS_ARRAY_OBJ_EMPTY',
            arrayObj: allEvents,
            message: this.t("eventsNotFound"),
            code: NOT_FOUND_ERROR
        });
        return allEvents;
    }

    async findEventsBySubmitter(submitter: string): Promise<EventDto[]> {
        const allEvents = await this.eventModel.find({
            submitter: submitter
        });
        await this.errorContext.execute({
            type: 'IS_ARRAY_OBJ_EMPTY',
            arrayObj: allEvents,
            message: this.t("eventsNotFound"),
            code: NOT_FOUND_ERROR
        });
        return allEvents;
    }

    async findEventsByOrgName(orgName: string): Promise<EventDto[]> {
        const allEvents = await this.eventModel.find({
            orgName: orgName
        });
        await this.errorContext.execute({
            type: 'IS_ARRAY_OBJ_EMPTY',
            arrayObj: allEvents,
            message: this.t("eventsNotFound"),
            code: NOT_FOUND_ERROR
        });
        return allEvents;
    }

    async createEvent(input: CreateEventInput): Promise<EventDto> {
        const newEvent = await this.eventModel.create(input);
        if (!newEvent) {
            await this.errorContext.execute({
                type: 'DIRECT_THROW', message: this.t("createEventError")
            });
        }
        return newEvent;
    }
};