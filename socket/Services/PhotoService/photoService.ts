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

  static async updatePhotoUrl(url: string, _id: mongoose.Types.ObjectId | string, expirationTime?: Date) {
    try {
      const expiration = expirationTime || new Date(Date.now() + 604800 * 1000);
      const updatedPhoto = await PhotosData.findByIdAndUpdate(
        _id,
        {
          imageUrl: url,
          urlExpirationTime: expiration,
        },
        { new: true }
      );
      return !!updatedPhoto;
    } catch (err) {
      console.error("Error updating photo url in db:", err);
      return false;
    }
  }

  static async getPhotosbyId(id: string) {
    try {
      if (!id) return [];

      const queryId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
      const photos = await PhotosData.find({
        $or: [{ uploader: queryId }, { uploader: id }]
      });
      console.log(`[PROFILE_MEDIA] 📂 Found ${photos.length} photos in DB for user ${id}`);

      return await Promise.all(
        photos.map(async (photo) => {
          let currentUrl = photo.imageUrl;
          let key = photo.key;

          // If key is missing but imageUrl is an S3 URL, try to extract key
          if (!key && currentUrl) {
            try {
              const parsed = new URL(currentUrl);
              key = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
            } catch (e) {
              // Not a valid URL, keep key undefined
            }
          }

          const expiration = photo.urlExpirationTime ? new Date(photo.urlExpirationTime) : null;
          const isExpired =
            !expiration ||
            isNaN(expiration.getTime()) ||
            new Date().getTime() >= expiration.getTime() - 10 * 60 * 1000;

          if (isExpired && key) {
            try {
              const reason = !expiration ? "missing expiration" : (isNaN(expiration.getTime()) ? "invalid date" : "expired/about to expire");
              console.log(`[PROFILE_MEDIA] 🔄 GENERATING NEW URL: Photo ${photo._id} (key: ${key}, reason: ${reason})`);
              const maxExpirySeconds = 604800; // 7 days (AWS S3 max presigned URL expiry)
              const newUrl = await AwsHandler.getObjectUrl(key, maxExpirySeconds);
              const newExpirationTime = new Date(Date.now() + maxExpirySeconds * 1000);

              await PhotosData.findByIdAndUpdate(photo._id, {
                imageUrl: newUrl,
                urlExpirationTime: newExpirationTime,
                ...(key && !photo.key ? { key } : {})
              });

              console.log(`[PROFILE_MEDIA] ✅ Generated & saved new URL to DB: Photo ${photo._id}`);
              currentUrl = newUrl;
            } catch (err) {
              console.error(`[PROFILE_MEDIA] ❌ Failed to generate new URL for photo ${photo._id}:`, err);
            }
          } else if (!key) {
            console.log(`[PROFILE_MEDIA] ⚠️ NO KEY available for photo ${photo._id}, using stored imageUrl`);
          } else {
            const remainingHours = expiration ? ((expiration.getTime() - Date.now()) / (1000 * 60 * 60)).toFixed(1) : 0;
            console.log(`[PROFILE_MEDIA] 🟢 URL VALID (NO new URL needed): Photo ${photo._id} (valid for ~${remainingHours} more hours)`);
          }

          return {
            id: photo._id,
            likes: photo.likes,
            uploadedAt: photo.uploadedAt,
            imageUrl: currentUrl,
            tags: photo.tags,
            caption: photo.caption,
          };
        })
      );
    } catch (err) {
      console.error("err in updating image url from aws s3:", err);
      return [];
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
