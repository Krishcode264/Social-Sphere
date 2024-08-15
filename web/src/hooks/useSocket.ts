// import { User } from "@/types/types";
// import { useEffect, useState } from "react";
// import { useRecoilValue } from "recoil";
// import { Socket } from "socket.io-client";
// import { io } from "socket.io-client";
// import { userInfoState } from "@/store/selectors/user-selector";

// export const useSocket = () => {
//   const user = useRecoilValue(userInfoState);
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const handleSocketConnection = (newUser: User): Promise<void> => {
//     return new Promise((resolve) => {
//       const uri=process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;
 
//       try {
//         const newsocket = io(uri || "http://localhost:8080", {
//           path: "/socket",
//           transports: ["websocket"],
//         });
//         console.log(newsocket)
//         setSocket(() => newsocket);
//         newsocket.emit("welcomeUser", newUser);
//         resolve();
//       } catch (err) {
//         console.log("error in connect to socket", err);
//       }
//     });
//   };
  

//   useEffect(() => {
//     (async () => {
//       console.log(user,"from socket hook")
//       if (user.name) {
//         await handleSocketConnection(user);
//       }
//     })();
//     return()=>{

//       if(socket){
//               console.log(
                
//                 "component unmouting , return from use socket running"
//              );
//         socket.disconnect()
//       }
//     }
//   }, [user]);

//   return { socket };
// };
