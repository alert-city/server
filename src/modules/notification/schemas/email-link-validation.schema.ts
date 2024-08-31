import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: true,
})
export class EmailLinkValidation {
  @Prop({ type: String })
  userId: string;

  @Prop({ type: String })
  activationToken: string;

  @Prop({ type: String })
  newUsername: string;
}

export const EmailLinkValidationSchema = SchemaFactory.createForClass(EmailLinkValidation);

