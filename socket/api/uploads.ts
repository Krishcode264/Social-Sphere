import express from "express";
import { Request, Response } from "express";
const uploadRouter = express.Router();
import { AwsHandler } from "../aws";
import { photoSchema, PhotosData } from "../mongoose/schemas/photoSchema";
import { UserData } from "../mongoose/schemas/userSchema";
import { PhotoService } from "../Services/PhotoService/photoService";
import UserService from "../Services/UserService/userService";
import type { UserSchemaType } from "../types/types";
import type { ObjectId } from "mongoose";
import mongoose from "mongoose";

export async function createPresignedUrl(req: Request, res: Response) {
  const { fileName, type } = req.query;
  const { id } = req.body.user;
  console.log(req.body.user, "user from token ");
  const key = `users/${id}/${Date.now()}_${fileName}`;
  try {
    const url = await AwsHandler.getPresignedUrlForS3(key, type);
    res.json({ url, key });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    res.status(500).json({ error: "Error generating presigned URL" });
  }
}

async function handleFileUploadSuccess(req: Request, res: Response) {
  const { key,caption ,tags } = req.body;
  const { id } = req.body.user;
  try {
    if (typeof key == "string" && typeof id == "string") {
      console.log(id, "id at handle file uplaod ");
      const url = await AwsHandler.getObjectUrl(key, 604800); //7 days od expiry
      const photo = await PhotoService.savePhoto({
        key: key,
        imageUrl: url,
        caption,
        tags,
        uploader: new mongoose.Types.ObjectId(id),
        urlExpirationTime: new Date(new Date().getTime() + 604600 * 1000),
      })
      console.log("image save success");
      res
        .status(200)
        .send({ message: "we saved your image url to databse ", photo });
    }
  } catch (err) {
    console.log(err, "err");
    res.status(404).json({ message: "something went wrong with image upload" });
  }
}
const handleUpdateUserProfile = async (req: Request, res: Response) => {
  const { data } = req.body;
  const { id } = req.body.user;
  //console.log(id,data)
  if (id && data) {
    //need to do further type cheaking with zod
    console.log("updating user");
    const user = await UserService.updateUserProfile(id, data);
    if (user) {
      res.send({ status: "success", user });
    } else {
      res.status(500).send({ status: "update failed" });
    }
  }
};

uploadRouter.use("/getPresignedUrl", createPresignedUrl);
uploadRouter.post("/success", handleFileUploadSuccess);
uploadRouter.post("/update-profile", handleUpdateUserProfile);
export default uploadRouter;
