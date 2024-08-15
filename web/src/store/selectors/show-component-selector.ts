import { selector } from "recoil";
import { showComponentState } from "../atoms/show-component";

// export const showCallState=selector({
//     key:"show-call",
//     get:({get})=>{
//         const {showCall}=get(showComponentState)
//         return showCall
//     },
//     set:({set,get},value)=>set(showComponentState,{showCall:value})
    
// })