import type { Schema } from "zod";

export type User = {
  name: string;
  id: string;
  profile?:string
};

export type Offer = {
  user: User;
  offer?: { sdp?: string; type: "offer" };
  offercreated?: { sdp?: string; type: "offer" };
  answer: { sdp?: string; type: "answer" };
  requestedUser?: User;
  receivedUser?: User;
};
export type OfferType = { sdp?: string; type: "offer" };
export type Candidate = {
  iceCandidateBuffer: RTCIceCandidate[];
  guest: User;
  offerer: User;
};

export type UserSchemaType = {
  name: string;
  createdAt: Date;
  id?: string;
  socketID?: string;
  email?: string;
  isConnected: boolean;
  country?: string;
  intrests?: string[];
  age?: number;
  gender?: string;
  profile?: string;
  intro?:string;
  places_want_to_visit:string[];
  languages_learning_or_speak?: string[];
};
export type PhotoType = {
  imageUrl: string;
  uploadedAt?: Date;
  likes?: [string];
  id:string;
  caption?:string;
  tags?:string[];
};
 export  interface FeedUserType {
    name: string;
    id: string;
    _id?: string;
    age: number;
    profile:string;
    location: string;

  }

  export type ConvoType={
    convoId:string,
    updatedAt:string,
    lastMessage:string,
    guestName:string,
    guestProfile:string,
    guestId:string,
  }
  export interface OfferSdp {
    sdp?: string;
    type: "offer";
  }
  export type ConnectedUsers = User[] | [];