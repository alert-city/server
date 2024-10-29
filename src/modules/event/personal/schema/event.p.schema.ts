import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Event extends Document {
  @Prop({ type: String })
  eventType: string;

  @Prop({ type: Date })
  dateTime: Date;

  @Prop({
    type: {
      type: String,
      enum: ['Point'], // GeoJSON 格式
      required: true,
    },
    coordinates: {
      type: [Number], // 经度和纬度
      required: true,
    },
  })
  location: {
    type: 'Point';
    coordinates: [number, number]; // [经度, 纬度]
  };

  @Prop({ type: String })
  subject: string;

  @Prop({ type: [String] })
  imageUrl: string[];

  @Prop({ type: String })
  eventStatus: string;

  @Prop({ type: Number })
  activeCount: number;

  @Prop({ type: Number })
  inactiveCount: number;

  @Prop({
    type: {
      topLeft: { lat: Number, lng: Number },
      topRight: { lat: Number, lng: Number },
      bottomLeft: { lat: Number, lng: Number },
      bottomRight: { lat: Number, lng: Number }
    }
  })
  eventRange: {
    topLeft: { lat: number, lng: number };
    topRight: { lat: number, lng: number };
    bottomLeft: { lat: number, lng: number };
    bottomRight: { lat: number, lng: number };
  };

  @Prop({ type: String })
  matter: string;

  @Prop({ type: String })
  submitter: string;
}

export const personalEventSchema = SchemaFactory.createForClass(Event);

// 为 location 字段创建地理索引
personalEventSchema.index({ location: '2dsphere' });