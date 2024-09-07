import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { eventSchema } from "@/modules/event/schemas/event.schema";
import { EventService } from "@/modules/event/services/event.service";
import { EventResolver } from "@/modules/event/event.resolver";
import { UnifiedErrorStrategyImpl } from '@/common/adjustment-strategies/unified-error.strategy';
import { UserModule } from "@/modules/user/user.module";

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'Event', schema: eventSchema}]),
        UserModule
    ],
    providers: [EventService, EventResolver, UnifiedErrorStrategyImpl],
    exports: [EventService],
})
export class EventModule {};