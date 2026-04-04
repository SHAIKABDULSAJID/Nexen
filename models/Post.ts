import mongoose, { Schema, Document } from "mongoose";

export interface IPostComment {
  userId: string;
  text: string;
  timestamp: Date;
  parentCommentId?: string; // For nested replies
}

export interface IPost extends Document {
  userId: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  likedByIds: string[];
  commentList: IPostComment[];
  reposts: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const postCommentSchema = new Schema<IPostComment>(
  {
    userId: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    parentCommentId: { type: String },
  },
  { _id: true },
);

const postSchema = new Schema<IPost>(
  {
    userId: { type: String, required: true, index: true },
    content: { type: String, required: true },
    image: { type: String },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    likedByIds: [{ type: String }],
    commentList: [postCommentSchema],
    reposts: { type: Number, default: 0 },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  },
);

export const Post = mongoose.model<IPost>("Post", postSchema);
