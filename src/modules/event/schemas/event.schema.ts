import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
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

    @Prop({required: true, type: String})
    submitter: string;

    @Prop({required: true, type: String})
    orgName: string;
};

export const eventSchema = SchemaFactory.createForClass(Event);