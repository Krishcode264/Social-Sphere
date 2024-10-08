import type { Socket } from "socket.io";
import { MessageService } from "./messageService";
import UserService from "../UserService/userService";
import { io } from "../..";
import type { MsgAttachment } from "../../types/types";

export const generateRoomId = (userId1: string, userId2: string) => {
  return [userId1, userId2].sort().join("-");
};
export type ReplyMessageType={
   _id:string;
    timestamp:string;
    content:string;
}
export const messageIoConection = (socket: Socket) => {
  socket.on(
    "newMessage",
    async (data: {
      sender: string;
      receiver: string;
      message: string;
      roomId: string;
      conformationId: string;
      repliedTo:string|null;
      attachmwnt?:MsgAttachment[]
      repliedToMessage:ReplyMessageType|null
    }) => {
    console.log(data,"new mag at socket ")


    
       const savedmsg = await MessageService.saveMessage(data);
       console.log("got the evevnt => message ");
       if (savedmsg) {
         const {
           _id,
           content,
           sender,
           recipient,
           timestamp,
           status,
           conversationId,
           repliedTo,
           attachment,
           ...message
         } = savedmsg;
         console.log("emititng message to  guest client => newMessage");
         const guestSocketId = await UserService.getUserSocketIdById(
           recipient?.toString() as string
         );

         io.to(data.roomId).emit(`newMessage_${data.roomId}`, {
           _id,
           sender,
           content,
           recipient,
           timestamp,
           status,
           repliedTo,
           confirmationId: data.conformationId,
           repliedToMessage: data.repliedToMessage,
           attachment
         });

         io.to(guestSocketId as string).emit("message_Notify", {
           roomId: data.roomId,
           content: content,
           sender,
           conversationId,
           timestamp,
         });
       }
    
  
     
    }
  );
  socket.on("startConvo", async (data) => {
    //console.log("got start convo from user ", data.userId);
    const roomId = generateRoomId(data.userId, data.guestId);
  //  console.log(roomId, "here is room id user connected ", data.userId);

    // cheacking users socket 
    if (!socket.rooms.has(roomId)) {
    //  console.log("joining user in the room ")
      socket.join(roomId);
    }

    // Fetch the guest's socket ID
    const guestSocketId = await UserService.getUserSocketIdById(data.guestId);
  //  console.log("here is guest socket id ", guestSocketId);

    if (guestSocketId) {
      const guestSocket = io.sockets.sockets.get(guestSocketId);

      if (guestSocket) {
        // Check if the guest's socket is already in the room
        if (!guestSocket.rooms.has(roomId)) {
      //    console.log("guest joined room ");
          guestSocket.join(roomId);
          socket
            .to(guestSocketId)
            .emit("joinedRoom", { guest: "new room joined " });
        } else {
          console.log("guest already in room");
        }
      }
    }
  });


//  socket.on("new-message",(data)=>{
//  const roomId = generateRoomId(data.userId, data.guestId);
//  console.log("got send evevnt on sopcket sending tot guest on room id",roomId)
//  socket.to(roomId).emit("send",data.m)
//   })
};
