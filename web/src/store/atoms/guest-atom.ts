"use client"
import { User } from "../../types/types"
import { atom } from "recoil"

export const guestState = atom<User>({
  key: "guest-state",
  default: {
   
      name: "",
      id: "",
      profile:"",
  
  },
});