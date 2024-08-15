import { Candidate, Offer, User, type UserSchemaType } from "../types/types";
import { Socket } from "socket.io";
import UserService from "../Services/UserService/userService";
import { io } from "..";
import { UserData } from "../mongoose/schemas/userSchema";

export function socketioConnection() {
  io.on("connection", async (socket: Socket) => {
    console.log("user connected", socket.id);
    //getting all active users, sending to newly connected user
    UserData.find(
      {
        isConnected: true,
        socketID: { $ne: socket.id },
      },
      "name id"
    ).then((activeUsers) => {
      socket.emit("activeUsers", activeUsers);
    });

    //sending newly connected user to alredy active members
    socket.on("newUserConnected", async (user: User) => {
      UserService.updateUserProfile(
        user.id,
        {
          socketID: socket.id,
          isConnected: true,
        }
      ).then((data) => {
        const { name, id } = user;
        console.log("new user connected", user.name);
        socket.broadcast.emit("newUserConnected", { name, id });
      });
    });

    //user disconnetion

    socket.on("disconnect",async  () => {
      console.log("disconnection with user comming from the client ");
     await UserData.findOneAndUpdate(
        { socketID: socket.id },
        { socketID: "", isConnected: false }
      ).then((data): any => {
        if (data) {
          console.log("user dissconnected ", data.name);

          socket.broadcast.emit("userDisconnected", {
            name: data.name,
            id: data.id,
          });
        }
      });
    });

    //making RTCP handshake
    socket.on(
      "receivedOfferForRTC",
      async ({ createdOffer: offer, requestedUser, user }: Offer) => {
        if (requestedUser) {
          UserService.getUserSocketIdById(requestedUser.id).then((socketID) => {
            if (socketID) {
              io.to(socketID).emit("receivedOfferForRTC", {
                user,
                offer,
              });
            }
          });
        }
      }
    );

    socket.on("handshaketoRTC", (data: User) => {
      console.log(data, "data from ahndshake with create answer from client ");
    });
    socket.on(
      "getCreateAnswerFromRequestedUser",
      async ({ answer, receivedUser }: Offer) => {
        console.log("getting create answer from req user", receivedUser);
        if (receivedUser) {
          UserService.getUserSocketIdById(receivedUser.id).then((socketID) => {
            if (socketID) {
              io.to(socketID).emit("receivedAnswerToRTC", {
                answer,
                receivedUser,
              });

              console.log("received answer", socketID);
            }
          });
        }
      }
    );
    socket.on(
      "candidate",
      async ({ candidate, persontoHandshake, user }: Candidate) => {
        console.log(
          "got candidate",
          "person to send :",
          persontoHandshake,
          "person who sent it",
          user
        );
        UserService.getUserSocketIdById(persontoHandshake.id).then(
          (socketID) => {
            if (socketID) {
              io.to(socketID).emit("candidate", { candidate, user });
              console.log("received  target user to send candidate");
            }
          }
        );
      }
    );
  });
}
