import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: true,
})
export class AccountActivation {
  @Prop({ type: String })
  userId: string;

  @Prop({ type: String })
  activationToken: string;
}

export const AccountActivationSchema = SchemaFactory.createForClass(AccountActivation);

