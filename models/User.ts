import mongoose, { Schema, Document } from "mongoose";

const DEFAULT_AVATAR_PATH = "/default-avatar.svg";

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  password?: string; // Optional for OAuth users
  role?: string;
  company?: string;
  phone?: string;
  location?: string;
  website?: string;
  avatar: string;
  bio: string;
  followingIds: string[];
  followerIds: string[];
  submittedPitchIds: string[]; // Track submitted ideas
  googleId?: string; // For Google OAuth
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for OAuth
    role: { type: String },
    company: { type: String },
    phone: { type: String },
    location: { type: String },
    website: { type: String },
    avatar: { type: String, default: DEFAULT_AVATAR_PATH },
    bio: { type: String, default: "" },
    followingIds: [{ type: String }],
    followerIds: [{ type: String }],
    submittedPitchIds: [{ type: String }], // Track submitted ideas
    googleId: { type: String }, // For Google OAuth
  },
  {
    timestamps: true,
  },
);

// Remove duplicate index definitions - they're already handled by unique: true
// userSchema.index({ email: 1 });
// userSchema.index({ username: 1 });
// userSchema.index({ googleId: 1 });

export const User = mongoose.model<IUser>("User", userSchema);
