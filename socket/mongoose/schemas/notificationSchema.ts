import mongoose from "mongoose";
import { Schema } from "mongoose";

const NotificationSchema = new Schema({
 type: { type: String, required: true }, 
  notifier: { type: Schema.Types.ObjectId, ref: "User", required: true },
  
  createdAt: { type: Date, default: Date.now }, 
  target: { userId:{ type: Schema.Types.ObjectId, ref: "User", required: true},mediaId:{ type: Schema.Types.ObjectId, ref: "Photo", } }, 
});

export const NotificationData = mongoose.model("Notification", NotificationSchema);