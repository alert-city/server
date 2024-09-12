import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UnifiedErrorStrategyImpl } from '@/common/adjustment-strategies/unified-error.strategy';
import { UserModule } from "@/modules/user/user.module";
import { personalEventSchema } from './schema/event.p.schema';
import { PersonalEventService} from '@/modules/event/personal/event.p.service';
import { PersonalEventResolver } from '@/modules/event/personal/event.p.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'PersonalEvent', schema: personalEventSchema}]),
    UserModule
  ],
  providers: [ UnifiedErrorStrategyImpl, PersonalEventService, PersonalEventResolver ],
  exports: [],
})
export class PersonalEventModule {}