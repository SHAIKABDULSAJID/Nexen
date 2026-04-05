import mongoose, { Schema, Document } from "mongoose";

export interface IFaq extends Document {
  question: string;
  answer: string;
  keywords: string[];
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const faqSchema = new Schema<IFaq>(
  {
    question: { type: String, required: true, unique: true, trim: true },
    answer: { type: String, required: true, trim: true },
    keywords: [{ type: String, trim: true, lowercase: true }],
    category: { type: String, default: "general", trim: true, lowercase: true },
  },
  {
    timestamps: true,
  },
);

export const FaqModel = mongoose.model<IFaq>("Faq", faqSchema);
