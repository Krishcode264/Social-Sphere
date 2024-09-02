import { NotificationData } from "../../mongoose/schemas/notificationSchema";
import {
  emitNotificationtotarget,
  type NotificationType,
} from "./notificationIo";

export class NotificationService {
  static createNotification = async (data: NotificationType) => {
    try {

          //  console.log(data , " at create notification ")
     const notificationDoc = await new NotificationData( data ).save();
     const notification = notificationDoc.toObject() as NotificationType;
    // console.log(notification,"created notification ")
    
    await emitNotificationtotarget(notification);
    } catch (err){
       console.log("err emiting notifuication",err)
    }
  };
}
