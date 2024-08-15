"use client"
import { User } from "../../types/types"
import { atom } from "recoil"
type GuestState = {
  persontoHandshake: User;
};
export const guestState = atom<GuestState>({
  key: "guest-state",
  default: {
    persontoHandshake: {
      name: "",
      id: "",
    },
  },
});