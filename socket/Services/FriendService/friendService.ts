import { FriendsData } from "../../mongoose/schemas/chatSchema";
import mongoose from "mongoose";
import { NotificationService } from "../NotificationService/NotificationService";

export class FriendService {
    static acceptRequest = async (userId: string, requesterId: string) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            // Add to user's friend list and remove from friendRequests
            await FriendsData.findOneAndUpdate(
                { user: userId },
                {
                    $pull: { friendRequests: requesterId },
                    $addToSet: { friends: requesterId },
                },
                { session }
            );

            // Add to requester's friend list and remove from sentRequests
            await FriendsData.findOneAndUpdate(
                { user: requesterId },
                {
                    $pull: { sentRequests: userId },
                    $addToSet: { friends: userId },
                },
                { session }
            );

            await NotificationService.createNotification({
                type: "friend-request-accepted",
                target: { userId: requesterId },
                notifier: userId,
            });

            await session.commitTransaction();
            session.endSession();
            return true;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error("Error accepting friend request:", error);
            return false;
        }
    };

    static declineRequest = async (userId: string, requesterId: string) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            // Remove from user's friendRequests
            await FriendsData.findOneAndUpdate(
                { user: userId },
                { $pull: { friendRequests: requesterId } },
                { session }
            );

            // Remove from requester's sentRequests
            await FriendsData.findOneAndUpdate(
                { user: requesterId },
                { $pull: { sentRequests: userId } },
                { session }
            );

            await session.commitTransaction();
            session.endSession();
            return true;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error("Error declining friend request:", error);
            return false;
        }
    };

    static unfriend = async (userId: string, friendId: string) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            // Remove friend from user's friend list
            await FriendsData.findOneAndUpdate(
                { user: userId },
                { $pull: { friends: friendId } },
                { session }
            );

            // Remove user from friend's friend list
            await FriendsData.findOneAndUpdate(
                { user: friendId },
                { $pull: { friends: userId } },
                { session }
            );

            await session.commitTransaction();
            session.endSession();
            return true;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error("Error unfriending user:", error);
            return false;
        }
    };

    static cancelRequest = async (userId: string, targetId: string) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            // Remove from user's sentRequests
            await FriendsData.findOneAndUpdate(
                { user: userId },
                { $pull: { sentRequests: targetId } },
                { session }
            );

            // Remove from target's friendRequests
            await FriendsData.findOneAndUpdate(
                { user: targetId },
                { $pull: { friendRequests: userId } },
                { session }
            );

            await session.commitTransaction();
            session.endSession();
            return true;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error("Error cancelling friend request:", error);
            return false;
        }
    };
}
