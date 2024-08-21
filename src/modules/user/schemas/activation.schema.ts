import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

@Schema({
  discriminatorKey: 'role.userType',
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: true,
})
export class Activation {
  @Prop({ type: String })
  userId: string;

  @Prop({ type: String })
  activationToken: string;
}

export const ActivationSchema = SchemaFactory.createForClass(Activation);

