import type { Socket } from "socket.io";
import UserService from "../UserService/userService";
export type NotificationType = {
  type: string;
  notifier: {
    id: string;
    name: string;
    profile?: string | null;
  };
  target: { userId: string; mediaId?: string };
  createdAt?: string;
};

let IOInstance: Socket | null;
export const notificationIO = (socket: Socket) => {
  IOInstance = socket;
};
export const emitNotificationtotarget = async (data: NotificationType) => {
  if (!IOInstance) {
    console.error("Socket instance is not initialized");
    return;
  }

  try {
    const targetSocketId = await UserService.getUserSocketIdById(
      data.target.userId
    );
    if (targetSocketId) {
        console.log("emitting notify to target")
      IOInstance.to(targetSocketId).emit("notification", data);
    } else {
      console.warn("Target user not connected");
    }
  } catch (error) {
    console.error("Error emitting notification:", error);
  }
};
