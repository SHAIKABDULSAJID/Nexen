import mongoose, { Schema } from "mongoose";
const postCommentSchema = new Schema({
    userId: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    parentCommentId: { type: String },
}, { _id: true });
const postSchema = new Schema({
    userId: { type: String, required: true, index: true },
    content: { type: String, required: true },
    image: { type: String },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    likedByIds: [{ type: String }],
    commentList: [postCommentSchema],
    reposts: { type: Number, default: 0 },
    tags: [{ type: String }],
}, {
    timestamps: true,
});
export const Post = mongoose.model("Post", postSchema);
