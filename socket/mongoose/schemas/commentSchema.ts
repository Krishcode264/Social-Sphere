import mongoose from "mongoose";
import { Schema } from "mongoose";

const commentSchema = new Schema({
  content: { type: String, required: true }, // Content of the comment
  commenter: {
    id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    profile: { type: String },
  }, // User who commented
  createdAt: { type: Date, default: Date.now }, // Timestamp of comment creation
  photo: { type: Schema.Types.ObjectId, ref: "Photo", required: true }, // Photo the comment is associated with
});

export const CommentData = mongoose.model("Comment", commentSchema);
