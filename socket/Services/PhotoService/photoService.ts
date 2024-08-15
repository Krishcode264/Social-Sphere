import mongoose, { Schema } from "mongoose";
import { AwsHandler } from "../../aws";
import { PhotosData } from "../../mongoose/schemas/photoSchema";
import { UserData } from "../../mongoose/schemas/userSchema";
import type { photoSchematype } from "../../types/types";

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
              const url = await AwsHandler.getObjectUrl(photo.key, 1800);
              await this.updatePhotoUrl(url, photo._id);
              console.log("updated image url of user ", url);
              return {
                id: photo._id,
                likes: photo.likes,
                uploadedAt: photo.uploadedAt,
                imageUrl: url,
              };
            }
           console.log(" we did not updated url its alredy valid ");
            return {
              id: photo._id,
              likes: photo.likes,
              uploadedAt: photo.uploadedAt,
              imageUrl: photo.imageUrl,
            };
          })
        );
      }
    } catch (err) {
      console.log(err, "err in updating image url from aws s3  ");
      throw Error;
    }
  }

  static handlePostLiked = async (photoId: string, userId: string) => {
    try {
      await PhotosData.findByIdAndUpdate(photoId, {
        $addToSet: { likes: userId },
      });
      await UserData.findByIdAndUpdate(userId, {
        $addToSet: { likedPhotos: photoId },
      });
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
