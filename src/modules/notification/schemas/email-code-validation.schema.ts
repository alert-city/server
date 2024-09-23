import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

@Schema({
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: true,
})
export class EmailCodeValidation {
  @Prop({ type: String })
  userId: string;

  @Prop({ type: String })
  verificationCode: string;

  @Prop({ type: Date })
  expires: Date;
}

export const EmailCodeValidationSchema =
  SchemaFactory.createForClass(EmailCodeValidation);
