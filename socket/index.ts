import http from "http";
import { socketioConnection } from "./webRTC";
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
import session from "express-session";
import cookieParser from "cookie-parser";
import { messageRouter } from "./api/message";
import { messageIoConection } from "./Services/MessageService/messageIo";
import { MessageService } from "./Services/MessageService/messageService";
import { UserData } from "./mongoose/schemas/userSchema";
import type { User } from "./types/types";
import UserService from "./Services/UserService/userService";
export const io = new Server(httpServer, { path: "/socket" });
async function init() {
  app.use(
    cors({
      origin: "http://localhost:3000", // Adjust this to your frontend origin
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
    session({
      secret: "your-session-secret",
      resave: false,
      saveUninitialized: true,
    })
  );
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
  app.use("/post-events",postEventsRouter);
  app.use("/message", checkTokenValidity,messageRouter);
  app.get("/health", (req, res) => {
    res.cookie("token","this is token as coojkie ")
    res.send("running :)");
  });
  httpServer.listen(process.env.PORT || 8080, () => {
    console.log("server is listening on port 8080");
    connectMongo();
io.on("connection",(socket)=>{



  // socketioConnection(socket);
  messageIoConection(socket);

    socket.on("newUserConnected", async (user: User) => {
      console.log("user connnedted",user.name)
      UserService.updateUserProfile(user.id, {
        socketID: socket.id,
        isConnected: true,
      })
    });

     socket.on("disconnect", async () => {
       console.log("disconnection with user comming from the client ");
       await UserData.findOneAndUpdate(
         { socketID: socket.id },
         { socketID: "", isConnected: false }
       )
     });
})
    
  
  });
}
init();
