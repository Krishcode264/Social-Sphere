// "use client"
// import { userBasicInfoState, UserPhotosState, userPreferencesState } from "@/store/atoms/user-atom";
// import axios from "axios";


// import { useEffect, useState } from "react";
// import { useRecoilState, useSetRecoilState } from "recoil";

// export const useAuth = () => {
//   const [isValid, setIsValid] = useState({ status: false, message: "" });
//   const [isLoading, setIsLoading] = useState(true);
//   const [user, setUser] = useRecoilState(userBasicInfoState);
//   const setPhotos=useSetRecoilState(UserPhotosState)
//   useEffect(() => {
//     const token = sessionStorage.getItem("token");

//     const validate = async () => {
//       try {
    
//     if (token && !user.id) {
//         console.log(user?.id,"here is user id ")
//           const res = await axios.get(
//             `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/feed/getUserByToken`,
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//               },
//             }
//           );
//           if (res.data?.user) {
//             setUser((prev) => ({ ...prev, ...res.data.user }));
//             setPhotos((prev)=>([...res.data.photos]))
//             setIsValid({ status: true, message: "" });
//             console.log("status is true here ");
//           } else {
//             setIsValid({
//               status: false,
//               message: "Your token has expired, need login ",
//             });
                
//           }
//         } else {
//           setIsValid({
//             status: false,
//             message: "You need to authenticate...",
//           });
//           console.log(" we dont hav etoken nor google auth ");
//         }
//       } catch (error) {
//         setIsValid({
//           status: false,
//           message: "An error occurred during validation.",
//         });
    
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     validate();
//   }, []);
//   return { isValid, isLoading, user };
// };
