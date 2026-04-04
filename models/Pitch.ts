import mongoose, { Schema, Document } from "mongoose";

export interface IPitch extends Document {
  title: string;
  description: string;
  category: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  upvotes: number;
  upvotedByIds: string[];
  comments: number;
  createdAt: Date;
  updatedAt: Date;
}

const pitchSchema = new Schema<IPitch>(
  {
    title: { type: String, required: true, maxlength: 80 },
    description: { type: String, required: true, maxlength: 300 },
    category: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String },
    userAvatar: { type: String },
    upvotes: { type: Number, default: 0 },
    upvotedByIds: { type: [String], default: [] },
    comments: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Pitch = mongoose.model<IPitch>("Pitch", pitchSchema);
