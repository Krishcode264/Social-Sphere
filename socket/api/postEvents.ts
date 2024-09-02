import { Router } from "express";
import { Response, Request } from "express";
import { PhotoService } from "../Services/PhotoService/photoService";
import { CommentData } from "../mongoose/schemas/commentSchema";
import { NotificationData } from "../mongoose/schemas/notificationSchema";
import { NotificationService } from "../Services/NotificationService/NotificationService";
import { UserData } from "../mongoose/schemas/userSchema";
import { PhotosData } from "../mongoose/schemas/photoSchema";
import { getObjectId } from "../lib/helpers";
export const postEventsRouter = Router();

const handlePostLikeDislike = async (req: Request, res: Response):Promise<any> => {
  const { photoId, action } = req.body;
  //console.log(req.body, "req.body at handle photto liked ");
  const { id: userId } = req.body.user;
  console.log(userId);
  if (photoId && userId) {
    try {
      if (action === "like") {
        await PhotoService.handlePostLiked(photoId, userId);
        res.send(true);
      }
      if (action === "dislike") {
        await PhotoService.handlePostDisliked(photoId, userId);
        res.send(true);
      }
    } catch (err) {
      res.status(400).send(false);
    }
  } else {
    res.send({ message: "photo id and user id are not there " });
  }
};

const getPostComments = async (req: Request, res: Response) => {
  const { id } = req.query;
  try {
    console.log("handle get post coment runnign");
    const comments = await CommentData.find({ photo: id })
      .select("commenter _id content ")
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    // const transformedComments = comments.map((comment) => ({
    //   commenter: comment.commenter,
    //   id: comment._id,
    //   content: comment.content,
    //   createdAt:comment.createdAt
    // }));
    res.send(comments);
  } catch (err) {
    console.log("err in fetching comments", err);
    res.status(500).send("thing went wrong in fetching comments ");
  }
};

const handlePostComment = async (req: Request, res: Response) => {
  //console.log(req, "req.body here ");
  const { userId, photoId, content, profile, name } = req.body;

  try {
    // console.log("handle post coment runnign");
    const createComment = await new CommentData({
      commenter: { id: userId, profile, name },
      photo: photoId,
      content,
    }).save();

    const post = await PhotosData.findById(photoId)
      .select("_id uploader")
      .lean();
    console.log(post, "post ");
    if (post && post.uploader) {
      console.log("running create notification");
      await NotificationService.createNotification({
        type: "commented",
        target: {
          userId: post.uploader.toString(),
          mediaId: photoId,
        },
        notifier: userId,
      });
    }

    //  console.log(createComment);
    res.status(200).send({
      content: createComment.content,
      commenter: createComment.commenter,
      id: createComment._id,
    });
  } catch (err) {
    console.log("comment on post failed", err);
    res.status(500).send("soemthing went wrong in posting the comment ");
  }
};
export const getUserNotifications = async (req: Request, res: Response) => {
  const { id } = req.body.user;
  try {


    
    const data = await NotificationData.aggregate([
      {
        $sort: { createdAt: -1 },
      },
      {
        $limit: 15,
      },
      {
        $match: { "target.userId": getObjectId(id) },   //match
      },
      {
        $lookup: {
          from: "users",
          localField: "notifier",
          foreignField: "_id",
          as: "notifier",
        },
      },
      { $unwind: "$notifier" },
      {
        $project: {
          _id: 1,
          type: 1,
          notifier: {
            name: "$notifier.name",
            id: "$notifier._id",
            profile: "$notifier.profile",
          },
          createdAt:1
        },
      },
    ]);
  
    res.send(data);

  } catch (err) {
    res
      .status(501)
      .send("soemthing went wrong in fetching user notifications ");
    console.log("err fetching notifications", err);
  }
};

postEventsRouter.use("/liked", handlePostLikeDislike);
postEventsRouter.get("/getComments", getPostComments);
postEventsRouter.post("/postComment", handlePostComment);
postEventsRouter.get("/notification", getUserNotifications);
