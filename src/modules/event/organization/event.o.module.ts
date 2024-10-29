import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { organizationEventSchema } from "@/modules/event/organization/schemas/event.o.schema";
import { OrganizationEventService } from "@/modules/event/organization/event.o.service";
import { OrganizationEventResolver } from "@/modules/event/organization/event.o.resolver";
import { UnifiedErrorStrategyImpl } from '@/common/adjustment-strategies/unified-error.strategy';
import { UserModule } from "@/modules/user/user.module";
import { PubSub } from 'graphql-subscriptions';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Event', schema: organizationEventSchema }]),
        UserModule
    ],
    providers: [
        OrganizationEventService,
        OrganizationEventResolver,
        UnifiedErrorStrategyImpl,
        {
            provide: 'PUB_SUB',
            useValue: new PubSub()
        }
    ],
    exports: [OrganizationEventService],
})
export class OrganizationEventOModule { }