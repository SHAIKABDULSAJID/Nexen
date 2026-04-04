import mongoose, { Schema } from "mongoose";
const DEFAULT_AVATAR_PATH = "/default-avatar.svg";
const userSchema = new Schema({
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
    googleId: { type: String }, // For Google OAuth
}, {
    timestamps: true,
});
// Remove duplicate index definitions - they're already handled by unique: true
// userSchema.index({ email: 1 });
// userSchema.index({ username: 1 });
// userSchema.index({ googleId: 1 });
export const User = mongoose.model("User", userSchema);
