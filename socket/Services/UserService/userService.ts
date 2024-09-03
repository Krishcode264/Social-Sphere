import mongoose, { type ObjectId } from "mongoose";
import { UserSchemaType, type User } from "../../types/types";
import { userSchema } from "../../mongoose/schemas/userSchema";
import { v4 as uuidv4 } from "uuid";
import { UserData } from "../../mongoose/schemas/userSchema";
import { PhotosData } from "../../mongoose/schemas/photoSchema";
import { AwsHandler } from "../../aws";
import { FriendsData } from "../../mongoose/schemas/chatSchema";
import { getObjectId } from "../../lib/helpers";

export default class UserService {
  static saveUserData = async (
    data: UserSchemaType,

    authType: { provider: string; expires?: string }
  ): Promise<UserSchemaType | null> => {
    try {
      const newUser = new UserData({ ...data, id: uuidv4(), authType });
      const savedUser = await newUser.save();
      return savedUser as UserSchemaType | null; // Update the type of savedUser
    } catch (err) {
      console.log(err, "error in savingf user");
      return null;
    }
  };
  static checkUserAlreadyExist = async (email: string) => {
    const users = await UserData.find({ email });
    return users;
  };

  static deleteUserData = async (
    id: string
  ): Promise<UserSchemaType | null> => {
    try {
      const deletedUser = await UserData.findOneAndDelete({ socketID: id });
      return deletedUser as UserSchemaType | null; // Update the type of deletedUser
    } catch (err) {
      console.log(err, "err deleting user ");
      return null;
    }
  };

  static getUserSocketIdById = async (id: string): Promise<string | false> => {
    try {
      const targetUser: UserSchemaType | null = await UserData.findById(getObjectId(id));

      if (!targetUser?.socketID) {
        return false; // Return null when user is not found
      }

      return targetUser.socketID;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      return false;
      // Handle the error or rethrow for higher-level handling
    }
  };

  static updateUserProfile = async (
    id: string,
    data: Partial<UserSchemaType>
  ): Promise<UserSchemaType | null> => {
    try {
      const updateUser = await UserData.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      );
      //  console.log(updateUser);
      return updateUser as UserSchemaType | null;
    } catch (err) {
      console.log(err, "update user failed");
      return null;
    }
  };

  static getUserProfile = async (id: string) => {
    try {
      const User = await UserData.findById(id).select(
        "name age email  profile gender intrests _id  languages_learning_or_speak pronouns userName places_want_to_visit likedPhotos"
      );
      // const photos = await PhotosData.find({ uploader: User?._id }).select(
      //   "key imageUrl uploadedAt likes _id urlExpirationTime"
      // );

      // const updatedurlPhotos = await Promise.all(
      //   photos.map(async (photo) => {
      //     //  console.log(photo)
      //     if (new Date() > new Date(photo.urlExpirationTime.toISOString())) {
      //       //checking if url expired
      //       const url = await AwsHandler.getObjectUrl(photo.key, 604800); //setting up 7 days min of expiration time  :)
      //       await PhotosData.findByIdAndUpdate(photo._id, { imageUrl: url });
      //       return {
      //         likes: photo.likes,
      //         uploadedAt: photo.uploadedAt,
      //         imageUrl: url,
      //         id: photo._id,
      //       };
      //     }
      //     return {
      //       likes: photo.likes,
      //       uploadedAt: photo.uploadedAt,
      //       imageUrl: photo.imageUrl,
      //       id: photo._id,
      //     };
      //   })
      // );
      //   console.log({ ...user?.toObject(), photos: updatedurlPhotos });
      return {
         ...User?.toObject(), id: User?._id 
      };
    } catch (err) {
      console.log("something went wrong in fetching user profile", err);
      return null;
    }
  };
static getObjectId=(id:string)=>{
 return  new mongoose.Schema.ObjectId(id)
}
 static  checkUserInFriendLists = async (userId: string, targetUserId: string) => {
    try {
    // console.log(await FriendsData.find({user:userId}))
    // const projectFieldsResult = await FriendsData.aggregate([
    //   { $match: { user: new mongoose.Types.ObjectId(userId) } },
    //   { $project: { friends: 1, friendRequests: 1, sentRequests: 1 } },
    // // ]);
    // console.log(projectFieldsResult,"dwdwverve");
    //  console.log(userId,targetUserId,"user id target user id ")
      const result = await FriendsData.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        {
          $project: {
            connectionStatus: {
              $cond: [
                {
                  $in: [new mongoose.Types.ObjectId(targetUserId), "$friends"],
                },
                "friends",
                {
                  $cond: [
                    {
                      $in: [
                        new mongoose.Types.ObjectId(targetUserId),
                        "$friendRequests",
                      ],
                    },
                    "requested",
                    {
                      $cond: [
                        {
                          $in: [
                            new mongoose.Types.ObjectId(targetUserId),
                            "$sentRequests",
                          ],
                        },
                        "sentRequest",
                        "new",
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
      ]);
  //console.log(result, "connection status ");
      if (result.length === 0) {
            return "new"
      }
    
      return  result[0].connectionStatus 
    } catch (err) {
      console.error("Error checking user in friend lists:", err);
      throw err; // or handle the error as needed
    }
  };
}
