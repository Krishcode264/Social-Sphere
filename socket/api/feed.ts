import express, { Request, Response } from "express";
export const feedRouter = express.Router();
import UserService from "../Services/UserService/userService";
import { UserData } from "../mongoose/schemas/userSchema";
import jwt, { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import { PhotoService } from "../Services/PhotoService/photoService";
import { PhotosData } from "../mongoose/schemas/photoSchema";
import checkTokenValidity from "../middlewares/authenticate_jwt";
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
  if (isString(id)) {
    res.send(await PhotoService.getPhotosbyId(id));
  }
}
export async function getUser(req: Request, res: Response) {
  const { id } = req.query
   // console.log("req is coming to get user by user id ")
  try {
    if (isString(id)) {
      const userProfile = await UserService.getUserProfile(id);
      res.send(userProfile);
    }
  } catch (error) {
    res.status(401).send({ error: "Invalid or expired token" });
  }
}
export async function getUserByToken(req: Request, res: Response) {
  const { id } = req.body.user
 // console.log(req.body, "at get token by id ");
  try {
    const userProfile = await UserService.getUserProfile(id);
    res.send(userProfile);
  } catch (error) {
    console.log(error);
    res.status(401).send({ error: "Invalid or expired token" });
  }
}

feedRouter.get("/getFeedUsers", getFeedUsers);
feedRouter.get("/getUser", checkTokenValidity, getUser);
feedRouter.get("/getUserByToken",checkTokenValidity, getUserByToken);
feedRouter.get("/getUserPhotos", checkTokenValidity, getUserPhotos);

