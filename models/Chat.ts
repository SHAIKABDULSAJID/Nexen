import mongoose, { Schema, Document } from "mongoose";

export interface IChatMessage {
  senderId: string;
  text: string;
  timestamp: Date;
}

export interface IChat extends Document {
  conversationKey: string;
  participantIds: string[];
  messages: IChatMessage[];
  lastMessage: string;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    senderId: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true },
);

const chatSchema = new Schema<IChat>(
  {
    conversationKey: { type: String, required: true, unique: true },
    participantIds: {
      type: [String],
      required: true,
      validate: {
        validator: (ids: string[]) => ids.length === 2,
        message: "A direct chat must have exactly two participants",
      },
    },
    messages: { type: [chatMessageSchema], default: [] },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

chatSchema.index({ lastMessageAt: -1 });

export const ChatModel = mongoose.model<IChat>("Chat", chatSchema);
