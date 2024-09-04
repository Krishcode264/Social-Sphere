import http from "http";
import express from "express";
const app = express();
export const httpServer = http.createServer(app);
import { connectMongo } from "./mongoose/connectMongo";
import { Server } from "socket.io";
import { authRouter } from "./api/auth";
import cors from "cors";
import bodyParser from "body-parser";
import checkTokenValidity from "./middlewares/authenticate_jwt";
import { feedRouter } from "./api/feed";
import uploadRouter from "./api/uploads";
import createGraphqlServer from "./graphql/index";
import { expressMiddleware } from "@apollo/server/express4";
import { postEventsRouter } from "./api/postEvents";
import cookieParser from "cookie-parser";
import { messageRouter } from "./api/message";
import { messageIoConection } from "./Services/MessageService/messageIo";
import { MessageService } from "./Services/MessageService/messageService";
import { UserData } from "./mongoose/schemas/userSchema";
import type { User } from "./types/types";
import { webRtcIoConnection } from "./webRTC";
import { notificationIO } from "./Services/NotificationService/notificationIo";
export const io = new Server(httpServer, { path: "/socket" });
async function init() {
  app.use(
    cors({
      origin: [process.env.WEB_CLIENT_URL as string ,"http://localhost:3000"], 
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Authorization", "Content-Type"],
      credentials: true,
    })
  );
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(express.json());
  app.use(
    "/graphql",
    checkTokenValidity,
    expressMiddleware(await createGraphqlServer())
  );
  app.get("/socket", (req) => {});
  // app.post("/validateToken", checkTokenValidity);
  app.use("/auth", authRouter);
  app.use("/feed", feedRouter);
  app.use("/uploads", checkTokenValidity, uploadRouter);
  app.use("/post-events", checkTokenValidity, postEventsRouter);
  app.use("/message", checkTokenValidity, messageRouter);
  app.get("/health", (req, res) => {
    console.log("req is comming on health")
    res.cookie("token", "this is token as coojkie ");
    res.send(" healthy :) 11 ");
  });
  httpServer.listen(process.env.PORT || 8080, () => {
    console.log("server is listening on port ", process.env.PORT);
    connectMongo();

    io.on("connection", (socket) => {
      //  webrtc socket io activation 
      webRtcIoConnection(socket);
      //mesages socket io activation
      messageIoConection(socket);
       //notification io 
       notificationIO(socket)
      socket.on("newUserConnected", async (user: User) => {
     //   console.log("user connnedted", user.name);
        await MessageService.updateSocketId(user.id, socket.id, true);

        socket.on("disconnect", async () => {
          console.log(
            //"disconnection with user comming from the client ",
            socket.id
          );
          try {
            await UserData.findOneAndUpdate(
              { socketID: socket.id },
              { socketID: "", isConnected: false }
            );
         //   console.log("user socket id removed success");
          } catch (err) {
            console.log("err removing useres socket id after disconnection");
          }
        });
      });
    });
  });
}
init();
