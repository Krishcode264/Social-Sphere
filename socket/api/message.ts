import express, { Request, Response, type response } from "express";
import {
  ConversationData,
  FriendsData,
  MessageData,
} from "../mongoose/schemas/chatSchema";
import { UserData } from "../mongoose/schemas/userSchema";
import UserService from "../Services/UserService/userService";
import mongoose, { Schema } from "mongoose";
export const messageRouter = express.Router();

const getMessageHistory = async (req: Request, res: Response) => {
  const { guestId, skip } = req.query;
  const { id } = req.body.user;
  const guestInfo = await UserData.findById(guestId)
    .select("profile name ")
    .lean()
    .exec();
  const convoData = await ConversationData.findOne({
    participants: { $all: [id, guestId] },
  });
  if (convoData) {
    const messages = await MessageData.find({ conversationId: convoData._id })
      .sort({ timestamp: -1 })
      .limit(20)
      .lean();
    return res.send({
      guestInfo,
      messages: messages.reverse(),
      convoId: convoData._id,
    });
  }
  //sending messages as empty arry if convo has not done before ....
  res.send({ guestInfo, messages: [] });
};

const getUserConvos = async (req: Request, res: Response) => {
  try {
    const { id } = req.body.user;
    const c = await ConversationData.find({ participants: { $in: [id] } })
      .sort({ updatedAt: 1 })
      .lean();

    const convos = await Promise.all(
      c.map(async (convo) => {
        const guestinfo = await UserData.findById(
          convo.participants.find((pid) => pid.toString() !== id.toString())
        ).select("profile name _id ");
        return {
          convoId: convo._id,
          updatedAt: convo.updatedAt,
          lastMessage: convo.lastMessage,
          guestName: guestinfo?.name,
          guestProfile: guestinfo?.profile,
          guestId: guestinfo?._id,
        };
      })
    );
    // console.log(convos,"convos at getuserconvos ")
    res.send({ data: convos });
  } catch (er) {
    console.log("err in sending user convos ");
    res.status(500).send();
  }
};

const handleFriendRequests = async (req: Request, res: Response) => {
  const { id } = req.body.user; //the one who sends this req
  const { targetUserId, type } = req.query;  // target user 
 
  try {
 
    switch (type) {
      case "send":
        await FriendsData.findOneAndUpdate(
          { user: targetUserId },
          { $push: { friendRequests: id },   },
           { upsert: true } 
    
        );
        await FriendsData.findOneAndUpdate(
          { user: id },
          { $push: { sentRequests: targetUserId } },
          { upsert: true }
        );
        res.send({ message: "Friend request sent successfully" }).status(200);
        break;

      case "approve":
        await FriendsData.findOneAndUpdate(
          { user: id },
          {
            $pull: { friendRequests: targetUserId },
            $push: { friends: targetUserId },
          },
          { upsert: true }
        );
        await FriendsData.findOneAndUpdate(
          { user: targetUserId },
          {
            $pull: { sentRequests: id },
            $push: { friends: id },
          },
          { upsert: true }
        );
        res.send({ message: "Friend request approved" }).status(200);
        break;

      case "revoke":
        await FriendsData.findOneAndUpdate(
          { user: id },
          { $pull: { sentRequests: targetUserId } },
          { upsert: true }
        );
        await FriendsData.findOneAndUpdate(
          { user: targetUserId },
          { $pull: { friendRequests: id } },
          { upsert: true }
        );
        res.send({ message: "Friend request revoked" }).status(200);
        break;

      case "discard":
        await FriendsData.findOneAndUpdate(
          { user: targetUserId },
          { $pull: { friendRequests: id } },
          { upsert: true }
        );
        await FriendsData.findOneAndUpdate(
          { user: id },
          { $pull: { sentRequests: targetUserId } },
          { upsert: true }
        );
        res.send({ message: "Friend request discarded" }).status(200);
        break;

      default:
        res.send({ message: "Invalid request type" }).status(400);
        break;
    }


    console.log("Transaction committed successfully.");
  } catch (error) {
  

    console.error("Transaction aborted due to an error:", error);
    res.send({ message: "Error processing friend request" }).status(500);
  } 
};

messageRouter.get("/getMessageHistory", getMessageHistory);
messageRouter.get("/getConvos", getUserConvos);
messageRouter.use("/friend-request", handleFriendRequests);
