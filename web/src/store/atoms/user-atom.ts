"use client";
import { UserSchemaType } from "../../types/types";
import { atom } from "recoil";
import { PhotoType } from "../../types/types";
import type { Gender } from "@/components/profile/guestProfileView";
// import { recoilPersist } from "recoil-persist";

export interface UserBasicInfo {
  name: string;
  id: string;
  age: number;
  email: string;
  gender: Gender;
  profile: string;
  userName: string;
  country: string;
  intrests: string[];
  pronouns: string;
  intro:string;
  sexuality: string;
  likedPhotos:string[];
  languages_learning_or_speak: string[];
  places_want_to_visit: string[];
  [key: string]: string | number | string[] | undefined; // Index signature
}

// const { persistAtom } = recoilPersist();
export const userBasicInfoState = atom<UserBasicInfo>({
  key: "user-basic-info-state",
  default: {
    name: "",
    id: "",
    age: 20,
    gender: "Unknown",
    email: "",
    profile: "",
    userName: "",
    country: "",
    intro:"",
    intrests: [],
    pronouns: "",
    sexuality: "",
    languages_learning_or_speak: [],
    likedPhotos: [],
    places_want_to_visit: [],
  },
  // effects_UNSTABLE: [persistAtom],
});

// User connectivity status
export const userConnectivityState = atom({
  key: "user-connectivity-state",
  default: {
    isConnected: false,
    socketID: '',
  }
});

// User interests and preferences
export const userPreferencesState = atom({
  key: "user-preferences-state",
  default: {
    country: '',
    intrests: [],
    pronouns:"",
    sexuality: '',
    languages_learning_or_speak: [],
    places_want_to_visit:[],
  }
});

//user photos 
export const UserPhotosState=atom<PhotoType[]|[]>({
  key:"user-photos-state",
  default:[]
})


export const UserAuthState=atom({
  key:"user-auth-state",
  default:{
    isAuthenticated:false
  }
})