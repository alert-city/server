import { Injectable } from "@nestjs/common";
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ErrorContext } from '@/common/adjustment-strategies/error-context';
import { I18nService } from '@/modules/i18n/i18n.service';
import { UnifiedErrorStrategyImpl } from '@/common/adjustment-strategies/unified-error.strategy';
import { PersonalEventResponseDto } from "./dtos/event.p.dto.response";
import { NOT_FOUND_ERROR } from '@/common/constants/code';
import  { PersonalEventRequestDto } from './dtos/event.p.dto.request';

@Injectable()
export class PersonalEventService {
  private readonly errorContext: ErrorContext;

  constructor(
    @InjectModel('PersonalEvent')
    private readonly eventModel: Model<PersonalEventResponseDto>,
    private readonly unifiedErrorStrategy: UnifiedErrorStrategyImpl,
    private readonly i18nService: I18nService,
  ) {
    this.errorContext = new ErrorContext(this.unifiedErrorStrategy);
  }

  private t(key: string): string {
    return this.i18nService.getTranslation(key);
  }

  async findAllPsnEvents():Promise<PersonalEventResponseDto[]>{
    const allEvents = await this.eventModel.find();
    await this.errorContext.execute({
      type: 'IS_ARRAY_OBJ_EMPTY',
      arrayObj: allEvents,
      message: this.t("eventsNotFound"),
      code: NOT_FOUND_ERROR
    });
    return allEvents;
  }


  async createPsnEvent(input:PersonalEventRequestDto):Promise<PersonalEventResponseDto>{
    return await this.eventModel.create(input);
  }



}