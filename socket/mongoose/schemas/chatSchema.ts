import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent",
  },
  attachment: {
    fileUrl: {
      type: String,
      required: false,
    },
    fileType: {
      type: String,
      enum: ["photo", "audio", "video"],
      required: false,
    },
    fileSize: {
      type: Number,
      required: false,
    },
  },
});

const conversationSchema = new Schema({
  participants: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  lastMessage: { type: Date },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isGroupChat: {
    type: Boolean,
    default: false,
  },
  conversationName: {
    type: String,
    required: false,
  },
});




const FriendsSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  friends: [{ type: Schema.Types.ObjectId, ref: "User",}],
  friendRequests: [
    { type: Schema.Types.ObjectId, ref: "User", createdAt: {type : Date , default:Date.now()}},
  ],
  sentRequests: [
    { type: Schema.Types.ObjectId, ref: "User",createdAt: {type : Date , default:Date.now()}},
  ],
});
export const MessageData = mongoose.model("Messages", messageSchema);
export const ConversationData = mongoose.model(
  "Conversation",
  conversationSchema
);
export const FriendsData = mongoose.model(
  "Friends",
  FriendsSchema
);