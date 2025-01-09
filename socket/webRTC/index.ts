import {
  Candidate,
  Offer,
  User,
  type HandShakeDataType,
  type UserSchemaType,
} from "../types/types";
import { Socket, type Server } from "socket.io";
import UserService from "../Services/UserService/userService";
import { io } from "..";
import { UserData } from "../mongoose/schemas/userSchema";
import { getObjectId } from "../lib/helpers";

export function webRtcIoConnection(socket:Socket) {
  //    console.log("user connected", socket.id);
  //   //  getting all active users, sending to newly connected user
  //     UserData.find(
  //       {
  //         isConnected: true,
  //         socketID: { $ne: socket.id },
  //       },
  //       "name id"
  //     }
  //     ).then((activeUsers) => {
  //       socket.emit("activeUsers", activeUsers);
  //     });

  //sending newly connected user to alredy active members
  // socket.on("newUserConnected", async (user: User) => {
  //   console.log("user connected",user)
  //   UserService.updateUserProfile(
  //     user.id,
  //     {
  //       socketID: socket.id,
  //       isConnected: true,
  //     }
  //   ).then((data) => {

  //     //console.log("new user connected", user.name);
  //     socket.broadcast.emit("newUserConnected", {...user});
  //   });
  // });

  //user disconnetion

  // socket.on("disconnect",async  () => {
  //   console.log("disconnection with user comming from the client ");
  //  await UserData.findOneAndUpdate(
  //     { socketID: socket.id },
  //     { socketID: "", isConnected: false }
  //   ).then((data): any => {
  //     if (data) {
  //       console.log("user dissconnected ", data.name);

  //       socket.broadcast.emit("userDisconnected", {
  //         name: data.name,
  //         id: data.id,
  //       });
  //     }
  //   });
  // });

  //making RTCP handshake
  socket.on("offer", async ({ offer, guest, offerer }: HandShakeDataType) => {
    if (guest) {
        console.log("1 => emititign to offer to guest",guest.id)
      const socketID=await UserService.getUserSocketIdById(guest.id);
            console.log("guests socket id ", socketID, guest.name);
     if (socketID) {
            console.log("guests socket id ",socketID,guest.name)
          io.to(socketID).emit("offer", {
            offer,
            guest,
            offerer,
          });
        }
      }})
  

//   socket.on("handshaketoRTC", (data: User) => {
//     console.log(data, "data from ahndshake with create answer from client ");
//   });
  socket.on(
    "answer",
    async ({ answer,guest,offerer }:HandShakeDataType) => {
      console.log("2=> getting create answer from req user", offerer);
      if (guest) {
        UserService.getUserSocketIdById(guest.id).then((socketID) => {
          if (socketID) {
            io.to(socketID).emit("answer", {
              answer,
              guest,
              offerer
            });
          }
        });
      }
    }
  );

  socket.on(
    "candidate",
    async ({ iceCandidateBuffer, guest, offerer }: Candidate) => {
      //console.log(guest,"this is from ",offerer.name)
      console.log("candidate",guest)
      UserService.getUserSocketIdById(guest.id).then((socketID) => {
        if (socketID) {
          io.to(socketID).emit("candidate", {
            iceCandidateBuffer,
            offerer,
            guest,
          });
          console.log("received  target user to send candidate");
        }
      });
    }
  );

    socket.on(
      "guest-candidate",
      async ({ iceCandidateBuffer, guest, offerer }: Candidate) => {
        //console.log(guest,"this is from ",offerer.name)
        UserService.getUserSocketIdById(guest.id).then((socketID) => {
          if (socketID) {
            io.to(socketID).emit("guest-candidate", {
              iceCandidateBuffer,
              offerer,
              guest,
            });
            console.log("received  target user to send candidate");
          }
        });
      }
    );
}
