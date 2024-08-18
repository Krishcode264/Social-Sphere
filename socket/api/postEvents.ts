import { Router } from "express";
import { Response, Request } from "express";
import { PhotoService } from "../Services/PhotoService/photoService";
import { CommentData } from "../mongoose/schemas/commentSchema";
import { PhotosData } from "../mongoose/schemas/photoSchema";
import checkTokenValidity from "../middlewares/authenticate_jwt";
export const postEventsRouter = Router();

const handlePostLikeDislike = async (req: Request, res: Response) => {
  const { photoId, action, userId } = req.body;
  //console.log(req.body, "req.body at handle photto liked ");

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
  try{
      console.log("handle get post coment runnign");
const comments = await CommentData.find({photo:id}).select("commenter _id content ").sort({ createdAt: -1 }).lean().exec()
// const transformedComments = comments.map((comment) => ({
//   commenter: comment.commenter,
//   id: comment._id,
//   content: comment.content,
//   createdAt:comment.createdAt
// }));
 res.send(comments)

  }catch(err){
console.log("err in fetching comments",err)
res.status(500).send("thing went wrong in fetching comments ")
  }

};

const handlePostComment=async(req:Request,res:Response)=>{
  console.log(req,"req.body here ")
const {userId,photoId,content,profile,name}=req.body

try{
  console.log("handle post coment runnign")
const createComment= await new CommentData({commenter:{id:userId,profile,name},photo:photoId,content}).save()

console.log(createComment)
 res.status(200).send({content:createComment.content,commenter:createComment.commenter,id:createComment._id})
}

catch(err){
  console.log("comment on post failed",err)
res.status(500).send("soemthing went wrong in posting the comment ")
}

   
}

postEventsRouter.use("/liked", handlePostLikeDislike);
postEventsRouter.get("/getComments", getPostComments);
postEventsRouter.post("/postComment", handlePostComment);
