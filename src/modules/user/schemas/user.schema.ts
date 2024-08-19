import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

// export type UserDocument = User & Document;

@Schema({
  discriminatorKey: 'role.userType',
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User {
  @Prop({
    type: {
      firstName: { type: String },
      lastName: { type: String },
      _id: false,
    },
  })
  name: Record<string, any>;

  @Prop({ type: String })
  orgName: string;

  @Prop({ type: String })
  username: string;

  @Prop({ type: String })
  password: string;

  @Prop({ type: String })
  displayName: string;

  @Prop({ type: String })
  accountType: string;

  @Prop({ type: [String] })
  role: string[];

  @Prop({ type: [String] })
  organization: string[];

  @Prop({ type: [String] })
  staffs: string[];

  @Prop({ type: String })
  mobilePhone: string;

  @Prop({ type: String })
  refreshToken: string;

  @Prop({ type: String })
  accessToken: string;

  @Prop({ type: String })
  avatarUrl: string;

  @Prop({ type: Number })
  codeAttempts: number;

  @Prop({
    type: {
      code: { type: String },
      expires: { type: Date },
      _id: false,
    },
  })
  verificationInfo: Record<string, any>;
}

export const UserSchema = SchemaFactory.createForClass(User);

