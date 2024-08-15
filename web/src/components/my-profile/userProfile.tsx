// import React from "react";
// import ProfilePic from "../profile/profile_photo";
// import {  ImageGallary } from "./Uploads";
// import { generateSinglet } from "./Ui";
// import { useRecoilState, useRecoilValue } from "recoil";
// import { userBasicInfoState, userPreferencesState } from "@/store/atoms/user-atom";

// const UserProfile = () => {

//   const intrests=["Yoga","Travel","Cooking","reading","Music"]
//   const languagesSpeak=["Marathi","Hindi","English"];
//   const lnaguageslearning=["Spanish","French"];
//   const countiresVisit=["Spain","France","Switzerland","US"];
// const user_preferences_state=useRecoilValue(userPreferencesState);
// const userBasicstate=useRecoilValue(userBasicInfoState)
//   console.log(user_preferences_state,"user prefrence state");
//   console.log(userBasicstate,"user basic info state");

// const Doublet=({property,value}:{property:string,value:string|number})=>{
//   return(
//     <div className="flex flex-col gap-1 ">
//       <span className="text-slate-400">{property}</span>
//       <span className="text-slate-900 mb-4">{value}</span>
//     </div>
//   )

// }

//       const [user] = useRecoilState(userBasicInfoState);

//   return (
//     <div className="w-[90%] md:w-[40%]mx-auto pb-2">
//       <div className="flex flex-col justify-center items-center">
//         <ProfilePic size={40} src={user.profile} iconSize={150}/>
//         <h2 className="text-blue-500">{user.name}</h2>
//         <div className="flex gap-3 m-4 text-slate-300">
//           <button className="bg-blue-500 px-2 p-1 rounded-xl hover:text-slate-100  ">
//             Friends 22
//           </button>
//         </div>
//       </div>

//       <h2 className="text-slate-800  text-2xl mb-3">About</h2>
//       <div className="p-1">
//         <hr />
//         <div className="flex justify-between ">
//           <Doublet property="Gender" value="Male" />
//           <Doublet property="Sexuality" value="Straight" />
//         </div>
//         <hr />
//         <div className="flex  justify-between ">
//           <Doublet property="Age" value="22" />
//           <Doublet property="Location" value="Kolkata, India" />
//         </div>
//         <hr />
//         <div className="flex  justify-between ">
//           <Doublet property="Email" value="email@gmail.com" />
//         </div>
//       </div>
//       <h4 className="font-semibold text-xl mb-3">Your photos</h4>
//       <ImageGallary />
//       <h2 className="text-slate-800  text-2xl mb-3">Intrests</h2>
//       <div className="flex flex-wrap gap-4 p-1">{generateSinglet(intrests)}</div>
//       <h2 className="text-slate-800  text-2xl mb-3">Languages</h2>
//       <h3 className="  mb-3 text-slate-400">Languages i Speak</h3>

//       <div className="flex gap-4 p-1">{generateSinglet(languagesSpeak)}</div>
//       <h3 className="text-slate-400  mb-3">Languages i am learning</h3>

//       <div className="flex gap-4 p-1">{generateSinglet(lnaguageslearning)}</div>

//       <h2 className="text-slate-800  text-2xl mb-3">
//         Countires i want to visit to
//       </h2>
//       <div className="flex gap-4 p-1">{generateSinglet(countiresVisit)}</div>

//       <h2 className="text-slate-800  text-2xl mb-3">Location</h2>
//       <span className="p-1  ">Kolkata,India</span>
//     </div>
//   );
// };

// export default UserProfile;
