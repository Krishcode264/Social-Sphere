import { atom } from "recoil";

export const userPermissionState=atom({
    key:"user-permission",
    default:{
        audio:'',
        video:""
    },

})