import express, { Request, Response } from "express";
import { ConversationData, MessageData } from "../mongoose/schemas/chatSchema";
import { UserData } from "../mongoose/schemas/userSchema";
import UserService from "../Services/UserService/userService";
import { Schema } from "mongoose";
export const messageRouter = express.Router();

const getMessageHistory = async (req: Request, res: Response) => {
  const { guestId } = req.query;
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
      .sort({ timestamp: 1 })
      .lean();
    return res.send({ guestInfo, messages, convoId: convoData._id });
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
        const guestinfo = await UserData.findById(convo.participants.find((pid) => pid.toString() !== id.toString())).select("profile name _id ");
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
messageRouter.get("/getMessageHistory", getMessageHistory);
messageRouter.get("/getConvos", getUserConvos);
