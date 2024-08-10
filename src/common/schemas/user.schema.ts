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

  // @Prop({ type: Date })
  // dob: Date;

  @Prop({ type: String })
  username: string;

  @Prop({ type: String })
  password: string;

  @Prop({ type: String })
  role: string

  @Prop({ type: String })
  mobilePhone: string;

  @Prop({ type: String })
  refreshToken: string;

  // @Prop({
  //   type: {
  //     userType: { type: String },
  //     userId: {
  //       type: mongoose.Schema.Types.ObjectId,
  //       refPath: 'role.userTypeRef',
  //     },
  //     _id: false,
  //   },
  // })
  // role: Record<string, any>;

  // @Prop({
  //   type: {
  //     email: { type: String },
  //     phone: { type: String },
  //     _id: false,
  //   },
  // })
  // contact: Record<string, any>;

  // @Prop({
  //   type: {
  //     houseNumber: { type: String },
  //     street: { type: String },
  //     suburb: { type: String },
  //     city: { type: String },
  //     state: { type: String },
  //     country: { type: String },
  //     postalCode: { type: String },
  //     _id: false,
  //   },
  // })
  // address: Record<string, any>;
}

export const UserSchema = SchemaFactory.createForClass(User);

// // 使用虚拟属性设置 refPath
// UserSchema.virtual('role.userTypeRef').get(function () {
//   return `${this.role.userType.charAt(0).toUpperCase() + this.role.userType.slice(1)}`; // e.g., 'students', 'teachers'
// });
//
// export { UserSchema };
