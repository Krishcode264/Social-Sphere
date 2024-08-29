import express, { Request, Response } from "express";
export const feedRouter = express.Router();
import UserService from "../Services/UserService/userService";
import { UserData } from "../mongoose/schemas/userSchema";
import jwt, { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import { PhotoService } from "../Services/PhotoService/photoService";
import { PhotosData } from "../mongoose/schemas/photoSchema";
import checkTokenValidity from "../middlewares/authenticate_jwt";
import { NotificationService } from "../Services/NotificationService/NotificationService";
function isString(value: any): value is string {
  return typeof value === "string";
}

export async function getFeedUsers(req: Request, res: Response): Promise<void> {
  try {
    const users = await UserData.find().select(
      "_id age name location gender profile"
    );

    res.status(200).send(users);
  } catch (err) {
    res.status(500).json({ message: "error fetching feed users" });
  }
}

export async function getUserPhotos(req: Request, res: Response) {
  const { id } = req.query;
  console.log("id of user in request.query",id)
  if (isString(id)) {
    res.send(await PhotoService.getPhotosbyId(id));
  }
}
export async function getUser(req: Request, res: Response) {
  const { id } = req.query
  const {id:userId,name ,profile}=req.body.user
   // console.log("req is coming to get user by user id ")
  try {
    if (isString(id)) {
      const userProfile = await UserService.getUserProfile(id);
  res.send(userProfile);

      if(userProfile && userProfile.user._id){
  await NotificationService.createNotification({
    type: "viewed-profile",
    target: {
      userId: userProfile?.user._id.toString(),
    },
    notifier: {
      profile,
      name,
      id: userId,
    },
  });
      }
       
    
    }
  } catch (error) {
    res.status(401).send({ error: "Invalid or expired token" });
  }
}
export async function getUserByToken(req: Request, res: Response) {
  const { id } = req.body.user
 // console.log(req.body, "at get token by id ");
  try {
      const user = await UserData.findById(id).select(
        "name age email  profile gender intrests _id  languages_learning_or_speak pronouns userName places_want_to_visit likedPhotos"
      ).lean();
    // console.log(user,"in getuser by token")
    res.send({ user:{...user,id:user?._id}});
  } catch (error) {
    console.log(error);
    res.status(401).send({ error: "Invalid or expired token" });
  }
}

feedRouter.get("/getFeedUsers", getFeedUsers);
feedRouter.get("/getUser", checkTokenValidity, getUser);
feedRouter.get("/getUserByToken",checkTokenValidity, getUserByToken);
feedRouter.get("/getUserPhotos", checkTokenValidity, getUserPhotos);

