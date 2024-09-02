import mongoose, { Schema } from "mongoose";
import { AwsHandler } from "../../aws";
import { PhotosData } from "../../mongoose/schemas/photoSchema";
import { UserData } from "../../mongoose/schemas/userSchema";
import type { photoSchematype } from "../../types/types";
import { emitNotificationtotarget, notificationIO } from "../NotificationService/notificationIo";
import { NotificationService } from "../NotificationService/NotificationService";

export class PhotoService {
  static async savePhoto(data: photoSchematype) {
    return await new PhotosData({ ...data }).save();
  }

  static async updatePhotoUrl(url: string, _id: mongoose.Types.ObjectId) {
    return new Promise(async (res, rej) => {
      try {
        const updatedPhoto = await PhotosData.findByIdAndUpdate(_id, {
          imageUrl: url,
          urlExpirationTime: new Date(new Date().getTime() + 1600 * 1000),
        });
        if (updatedPhoto) {
          res(true);
        }
      } catch (err) {
        rej(false);
      }
    });
  }

  static async getPhotosbyId(id: string) {
    try {
  
      if (id) {
        const photos = await PhotosData.find({ uploader:id });
    
        return await Promise.all(
          photos.map(async (photo) => {
            if (new Date() > new Date(photo.urlExpirationTime.toISOString())) {
              const url = await AwsHandler.getObjectUrl(photo.key, 604800);//7 days of expiry
              await this.updatePhotoUrl(url, photo._id);
             console.log("updated image url of user ");
              return {
                id: photo._id,
                likes: photo.likes,
                uploadedAt: photo.uploadedAt,
                imageUrl: url,
                tags:photo.tags,
                caption:photo.caption,
              };
            }
         //  console.log(" we did not updated url its alredy valid ");
            return {
              id: photo._id,
              likes: photo.likes,
              uploadedAt: photo.uploadedAt,
              imageUrl: photo.imageUrl,
              tags: photo.tags,
              caption: photo.caption,
            };
          })
        );
      }
    } catch (err) {
      console.log(err, "err in updating image url from aws s3  ");
     
    }
  }

  static handlePostLiked = async (photoId: string, userId: string) => {
    try {
     const data= await PhotosData.findByIdAndUpdate(photoId, {
        $addToSet: { likes: userId },
      },{new:true}).lean().select("uploader _id  ")
     const notifier= await UserData.findByIdAndUpdate(userId, {
        $addToSet: { likedPhotos: photoId },
      },{new:true}).lean().select("profile _id name");
      if(data && data?.uploader && notifier && notifier._id){

         await  NotificationService.createNotification({
            type: "photo-liked",
            target: {
              userId: data.uploader.toString(),
              mediaId: data._id.toString(),
            },
            notifier:notifier._id.toString(),
       } );
      }
  
      
    } catch (err) {
      console.log("error in mehtode handlelikedPost", err);
    }
  };

  static handlePostDisliked = async (photoId: string, userId: string) => {
    try {
    await PhotosData.findByIdAndUpdate(photoId, {
        $pull: { likes: userId },
      });

      await UserData.findByIdAndUpdate(userId, {
        $pull: { likedPhotos: photoId },
      });
    } catch (err) {
      console.log("error in mehtode handlelikedPost", err);
    }
  };
}
