import { io } from "../..";
import {
  ConversationData,
  MessageData,
} from "../../mongoose/schemas/chatSchema";
import { UserData } from "../../mongoose/schemas/userSchema";
import type { MsgAttachment } from "../../types/types";
export class MessageService {
  static saveMessage = async (data: {
    sender: string;
    receiver: string;
    message: string;
    repliedTo:string|null;
    attachment?:MsgAttachment[]
  }) => {
    try {
      let convoData = await ConversationData.findOne({
        participants: { $all: [data.receiver, data.sender] },
      }).lean();
      if (!convoData) {
        convoData = await new ConversationData({
          participants: [data.sender, data.receiver],
        }).save();
      }
      console.log(data.repliedTo ,"at save message ")

      return await new MessageData({
        recipient: data.receiver,
        sender: data.sender,
        conversationId: convoData._id,
        content: data.message,
        repliedTo:data.repliedTo,
        attachment:data.attachment
      }).save();
    } catch (er) {
      //we could send messager failure thing to user so that they can resend it 
      console.log("errr saving message",er);
      return null;
    }
  };

  // static joinFriendRoom=(socketId:string)=>{

  // }

  static async updateSocketId(
    userId: string,
    socketID: string,
    isConnected: boolean
  ): Promise<boolean> {
    try {
      await UserData.findByIdAndUpdate(userId, { socketID, isConnected });
      // console.log("updating socket id",socketID,"user is connected",isConnected);
      return true;
    } catch (err) {
      console.log("update user failed");
      return false;
    }
  }
}

