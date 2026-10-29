import express, { Request, Response, type response } from "express";
import {
  ConversationData,
  FriendsData,
  MessageData,
} from "../mongoose/schemas/chatSchema";
import { UserData } from "../mongoose/schemas/userSchema";
import UserService from "../Services/UserService/userService";
import mongoose, { Mongoose, Schema } from "mongoose";
import { getObjectId } from "../lib/helpers";
import { AwsHandler } from "../aws";
import { NotificationService } from "../Services/NotificationService/NotificationService";
export const messageRouter = express.Router();

const getMessageHistory = async (req: Request, res: Response) => {
  const { guestId, skip, limit } = req.query;
  // console.log(req.query, "req .query at server ");
  const { id } = req.body.user;
  // console.log(Number(skip as string));
  //we have to send guest profile and name
  // latest 20 messages btween them
  // message can have repliedto field we have to send that
  //message conetnt , id and how far it is from the current
  //tagged message

  //step 1 finding conversation between these two useres

  const completeMessagePagePayload = await ConversationData.aggregate([
    {
      $match: {
        participants: {
          $all: [getObjectId(id), getObjectId(guestId as string)],
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "participants",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    {
      $project: {
        guestInfo: {
          $filter: {
            input: "$userInfo",
            as: "user",
            cond: { $ne: ["$$user._id", getObjectId(id)] },
          },
        },
      },
    },
    {
      $unwind: { path: "$guestInfo", preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        "guestInfo._id": 1,
        "guestInfo.name": 1,
        "guestInfo.profile": 1,
      },
    },
    {
      $lookup: {
        from: "messages",
        localField: "_id",
        foreignField: "conversationId",
        as: "allMessages",
      },
    },
    {
      $project: {
        guestInfo: 1,
        allMessages: {
          $slice: [
            { $reverseArray: "$allMessages" },
            skip ? Number(skip) : 0,
            limit ? Number(limit) : 20,
          ],
        },
      },
    },

    {
      $lookup: {
        from: "messages",
        localField: "allMessages.repliedTo",
        foreignField: "_id",
        as: "repliedToMessages",
      },
    },
    {
      $project: {
        guestInfo: 1,
        messages: {
          $map: {
            input: "$allMessages",
            as: "msg",
            in: {
              _id: "$$msg._id",
              sender: "$$msg.sender",
              recipient: "$$msg.recipient",
              content: "$$msg.content",
              conversationId: "$$msg.conversationId",
              status: "$$msg.status",
              repliedTo: "$$msg.repliedTo",
              timestamp: "$$msg.timestamp",
              attachment: {
                $map: {
                  input: { $ifNull: ["$$msg.attachment", []] },
                  as: "att",
                  in: {
                    url: "$$att.url",
                    key: "$$att.key",
                    type: "$$att.type",
                    size: "$$att.size",
                    urlExpirationTime: "$$att.urlExpirationTime",
                  },
                },
              },
              repliedToMessage: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$repliedToMessages",
                      as: "replied",
                      cond: { $eq: ["$$replied._id", "$$msg.repliedTo"] },
                    },
                  },
                  0,
                ],
              },
            },
          },
        },
      },
    },
    {
      $unwind: { path: "$messages", preserveNullAndEmptyArrays: true },
    },
    {
      $group: {
        _id: "$_id",
        guestInfo: { $first: "$guestInfo" },
        messages: { $push: "$messages" },
      },
    },
    {
      $project: {
        _id: "$_id", // Include _id in the final result
        guestInfo: 1,
        messages: { $reverseArray: "$messages" }, // Reverse the final messages array
      },
    },
  ]);
  //  console.log(completeMessagePagePayload,"here is aggregation pipeline for messages ");

  // const convoData = await ConversationData.findOne({
  //   participants: { $all: [id, guestId] },
  // });
  //console.log(completeMessagePagePayload)
  if (completeMessagePagePayload.length > 0) {
    // Refresh expired attachment URLs before sending to client
    const payload = completeMessagePagePayload[0];
    if (payload.messages && Array.isArray(payload.messages)) {
      // Filter out any null messages from empty conversations
      payload.messages = payload.messages.filter(Boolean);

      for (const message of payload.messages) {
        if (message && message.attachment && Array.isArray(message.attachment)) {
          for (const attachment of message.attachment) {
            if (!attachment) continue;

            let key = attachment.key;
            // If key is missing, attempt to extract it from the presigned S3 url
            if (!key && attachment.url) {
              try {
                const parsed = new URL(attachment.url);
                key = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
                attachment.key = key;
              } catch (e) {
                // Not a valid URL
              }
            }

            if (key) {
              const expiration = attachment.urlExpirationTime ? new Date(attachment.urlExpirationTime) : null;
              // Check if URL has expired, missing expiration, or expiring within 10 minutes (buffer)
              const needsRefresh =
                !expiration ||
                isNaN(expiration.getTime()) ||
                new Date().getTime() >= expiration.getTime() - 10 * 60 * 1000;

              if (needsRefresh) {
                try {
                  const reason = !expiration ? "missing expiration" : (isNaN(expiration.getTime()) ? "invalid date" : "expired/about to expire");
                  console.log(`[CHAT_MEDIA] 🔄 GENERATING NEW URL: Attachment key: ${key} (reason: ${reason})`);
                  // Generate new presigned URL (max 7 days = 604800 seconds)
                  const maxExpirySeconds = 604800;
                  const newUrl = await AwsHandler.getObjectUrl(key, maxExpirySeconds);
                  const newExpirationTime = new Date(Date.now() + maxExpirySeconds * 1000);

                  // Update the attachment in the database with max expiry
                  const updateFilter: any = { _id: message._id };
                  if (attachment.key) {
                    updateFilter["attachment.key"] = attachment.key;
                  } else if (attachment.url) {
                    updateFilter["attachment.url"] = attachment.url;
                  }

                  await MessageData.updateOne(
                    updateFilter,
                    {
                      $set: {
                        "attachment.$.url": newUrl,
                        "attachment.$.urlExpirationTime": newExpirationTime,
                        ...(key ? { "attachment.$.key": key } : {}),
                      },
                    }
                  );

                  // Update the attachment in the response payload
                  attachment.url = newUrl;
                  attachment.urlExpirationTime = newExpirationTime;
                  attachment.key = key;
                  console.log(`[CHAT_MEDIA] ✅ Generated & saved new URL to DB: Attachment ${key}`);
                } catch (err) {
                  console.error(`[CHAT_MEDIA] ❌ Failed to generate URL for attachment ${key}:`, err);
                }
              } else {
                const remainingHours = expiration ? ((expiration.getTime() - Date.now()) / (1000 * 60 * 60)).toFixed(1) : 0;
                console.log(`[CHAT_MEDIA] 🟢 URL VALID (NO new URL needed): Attachment ${key} (valid for ~${remainingHours} more hours)`);
              }
            }
          }
        }
      }
    }

    return res.send(payload);
  } else {
    const guestInfo = await UserData.findById(guestId)
      .select("profile name ")
      .lean()
      .exec();
    res.send({ guestInfo, messages: [] });
  }
  //sending messages as empty arry if convo has not done before ....
};

const getUserConvos = async (req: Request, res: Response) => {
  try {
    const { id } = req.body.user;
    const c = await ConversationData.find({ participants: { $in: [id] } })
      .sort({ updatedAt: 1 })
      .lean();

    const convos = await Promise.all(
      c.map(async (convo) => {
        const guestinfo = await UserData.findById(
          convo.participants.find((pid) => pid.toString() !== id.toString())
        ).select("profile name _id ");
        return {
          convoId: convo._id,
          updatedAt: convo.updatedAt,
          lastMessage: convo.lastMessage,
          guestName: guestinfo?.name,
          guestProfile: guestinfo?.profile,
          guestId: guestinfo?._id,
        };
      })
    );
    // console.log(convos,"convos at getuserconvos ")
    res.send({ data: convos });
  } catch (er) {
    console.log("err in sending user convos ");
    res.status(500).send();
  }
};

const handleFriendRequests = async (req: Request, res: Response) => {
  const { id } = req.body.user; //the one who sends this req
  const { targetUserId, type } = req.query; // target user

  try {

    switch (type) {
      case "send":
        await FriendsData.findOneAndUpdate(
          { user: targetUserId },
          { $addToSet: { friendRequests: id } }, // Use $addToSet to prevent duplicates
          { upsert: true }
        );
        await FriendsData.findOneAndUpdate(
          { user: id },
          { $addToSet: { sentRequests: targetUserId } }, // Use $addToSet to prevent duplicates
          { upsert: true }
        );
        await NotificationService.createNotification({
          type: "friend-request-received",
          target: { userId: targetUserId as string },
          notifier: id,
        });
        res.send({ message: "Friend request sent successfully" }).status(200);
        break;

      case "approve":
        await FriendsData.findOneAndUpdate(
          { user: id },
          {
            $pull: { friendRequests: targetUserId },
            $addToSet: { friends: targetUserId }, // Use addToSet to assume uniqueness
          },
          { upsert: true }
        );
        await FriendsData.findOneAndUpdate(
          { user: targetUserId },
          {
            $pull: { sentRequests: id },
            $addToSet: { friends: id }, // Use addToSet to assume uniqueness
          },
          { upsert: true }
        );
        await NotificationService.createNotification({
          type: "friend-request-accepted",
          target: { userId: targetUserId as string },
          notifier: id,
        });
        res.send({ message: "Friend request approved" }).status(200);
        break;

      case "revoke":
        await FriendsData.findOneAndUpdate(
          { user: id },
          { $pull: { sentRequests: targetUserId } },
          { upsert: true }
        );
        await FriendsData.findOneAndUpdate(
          { user: targetUserId },
          { $pull: { friendRequests: id } },
          { upsert: true }
        );
        res.send({ message: "Friend request revoked" }).status(200);
        break;

      case "discard":
        await FriendsData.findOneAndUpdate(
          { user: targetUserId },
          { $pull: { friendRequests: id } },
          { upsert: true }
        );
        await FriendsData.findOneAndUpdate(
          { user: id },
          { $pull: { sentRequests: targetUserId } },
          { upsert: true }
        );
        res.send({ message: "Friend request discarded" }).status(200);
        break;

      default:
        res.send({ message: "Invalid request type" }).status(400);
        break;
    }

    console.log("Transaction committed successfully.");
  } catch (error) {
    console.error("Transaction aborted due to an error:", error);
    res.send({ message: "Error processing friend request" }).status(500);
  }
};

messageRouter.get("/getMessageHistory", getMessageHistory);
messageRouter.get("/getConvos", getUserConvos);
messageRouter.use("/friend-request", handleFriendRequests);
