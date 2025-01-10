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
import { FriendsData } from "../mongoose/schemas/chatSchema";
import { getObjectId } from "../lib/helpers";
function isString(value: any): value is string {
  return typeof value === "string";
}

export async function getFeedUsers(req: Request, res: Response): Promise<void> {
  console.log("get feed useres getting req ")
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
  //console.log("id of user in request.query",id)
  if (isString(id)) {
    res.send(await PhotoService.getPhotosbyId(id));
  }
}
export async function getUser(req: Request, res: Response) {
  const { id } = req.query;
  const { id: userId } = req.body.user;
  // console.log("req is coming to get user by user id ")
  try {
    if (isString(id)) {
      const userProfile = await UserService.getUserProfile(id);
      const friendStatus = await UserService.checkUserInFriendLists(userId, id);
      console.log(friendStatus, "friend status at getuser ");
      res.send({ ...userProfile, friendStatus });
    console.log("check", userProfile?._id?.toString()===userId)
      if (
        userProfile &&
        userProfile._id &&
        userProfile?._id?.toString() !== userId
      ) {
       // console.log("notification service running ");
        await NotificationService.createNotification({
          type: "viewed-profile",
          target: {
            userId: userProfile?._id.toString(),
          },
          notifier: userId as string
        });
      }
    }
  } catch (error) {
    res.status(401).send({ error: "Invalid or expired token" });
  }
}
export async function getUserByToken(req: Request, res: Response) {
  const { id } = req.body.user;
  // console.log(req.body, "at get token by id ");
  try {
    const user = await UserData.findById(id)
      .select(
        "name age email  profile gender intrests _id  languages_learning_or_speak pronouns userName places_want_to_visit likedPhotos"
      )
      .lean();
    // console.log(user,"in getuser by token")
    res.send({ user: { ...user, id: user?._id } });
  } catch (error) {
    console.log(error);
    res.status(401).send({ error: "Invalid or expired token" });
  }
}

const handleFriendFetch = async (req: Request, res: Response) => {
  const { id } = req.body.user;
  const { type } = req.query;
  console.log(type, "type");
  try {
    const lookupFriends = await FriendsData.aggregate([
      {
        $match: { user: getObjectId(id) },
      },
      {
        $unwind: `$${type}`,
      },
      {
        $lookup: {
          from: "users",
          localField: type as string,
          foreignField: "_id",
          as: "friendDetails",
        },
      },
      { $unwind: "$friendDetails" },
      {
        $project: {
          _id: 0,

          id: "$friendDetails._id", // Rename friendDetails._id to id
          name: "$friendDetails.name", // Include friend's name
          profile: "$friendDetails.profile", // Include friend's profile
        },
      },
    ]);

    res.send(lookupFriends).status(200);
  } catch (err) {
    res.status(411).send({ message: "err in fetchinf relation collection" });
  }
};

export async function getmyProfile(req: Request, res: Response) {
  const { id, name, profile } = req.body.user;
  // console.log("req is coming to get user by user id ")
  try {
    if (isString(id)) {
      const userProfile = await UserService.getUserProfile(id);

      res.send({ ...userProfile });
    }
  } catch (error) {
    res.status(401).send({ error: "Invalid or expired token" });
  }
}

feedRouter.get("/getFeedUsers", getFeedUsers);
feedRouter.get("/getUser", checkTokenValidity, getUser);
feedRouter.get("/myprofile", checkTokenValidity, getmyProfile);
feedRouter.get("/getUserByToken", checkTokenValidity, getUserByToken);
feedRouter.get("/getUserPhotos", checkTokenValidity, getUserPhotos);
feedRouter.get("/relationlist", checkTokenValidity, handleFriendFetch);
