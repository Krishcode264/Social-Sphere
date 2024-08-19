import type { Socket } from "socket.io";
import { MessageService } from "./messageService";
import UserService from "../UserService/userService";
import { io } from "../..";

const generateRoomId = (userId1: string, userId2: string) => {
  return [userId1, userId2].sort().join("-");
};
export const messageIoConection = (socket: Socket) => {
  socket.on(
    "message",
    async (data: { sender: string; receiver: string; message: string ,roomId:string}) => {
        const  savedmsg=await MessageService.saveMessage(data)
console.log("got the evevnt => message ")
      if (savedmsg) {
        const { _id, content, sender, recipient, timestamp, status, ...message }=savedmsg;
        console.log("emititng message to  guest client => newMessage")
        const guestSocketId=await UserService.getUserSocketIdById(recipient.toString())
        console.log("emitting new Messgage direcvtly without room  ",guestSocketId)
        io.to(guestSocketId as string).emit("newMessage", {
          id: _id,
          sender,
          content,
          recipient,
          timestamp,
          status,
        });
            //  io.to(data.roomId).emit("newMessage", {
            //    id: _id,
            //    sender,
            //    content,
            //    recipient,
            //    timestamp,
            //    status
            //  });
      }
    }
  );

  socket.on("startConvo", async (data) => {
    console.log("got start convo from user ",data.userId)
//     const roomId = generateRoomId(data.userId, data.guestId);
//     console.log(roomId,"here is room id userconnced  ",data.userId)
//     socket.join(roomId);
//     const guestSocketId = await UserService.getUserSocketIdById(data.guestId);
//           console.log("here is guest socket id ", guestSocketId);
//     if (guestSocketId) {

//       const guestSocket = io.sockets.sockets.get(guestSocketId);
//       if (guestSocket) {
//         console.log("guest joined room ")
//         guestSocket.join(roomId);
//         socket.to(guestSocketId).emit("joinedRoom",{guest:"new room joined "})
// // (response: { error: any; status: any; }) => {
// //   if (response.error) {
// //     console.error("Failed to deliver message:", response);
// //   } else {
// //     console.log("Message delivered successfully:", response);
// //   }
//       }
//     }
  });
};
