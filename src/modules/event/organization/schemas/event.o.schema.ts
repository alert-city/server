import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";
import { User } from "@/modules/user/schemas/user.schema";

@Schema({
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
})
export class Event extends Document {
    @Prop({required: true, type: String})
    eventType: string;

    @Prop({required: true, type: String})
    date: string;

    @Prop({required: true, type: String})
    time: string;

    @Prop({type: String})
    location?: string;

    @Prop({required: true, type: String})
    subject: string;

    @Prop({required: true, type: String})
    matter: string;

    @Prop({type: String})
    ERTime?: string;

    @Prop({type: String})
    ERDate?: string;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true})
    submitter: User;

    @Prop({type: String})
    orgName?: string;

    @Prop({required: true, type: Boolean})
    isReviewed: boolean;

    @Prop({type: Boolean})
    isApproved?: boolean;

    @Prop({type: String})
    reviewComment?: string;
};

export const organizationEventSchema = SchemaFactory.createForClass(Event);