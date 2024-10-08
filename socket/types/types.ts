import type {  Types } from "mongoose";

export type User = {
  name: string;
  id: string;
  profile?:string
};
export type MsgAttachment={
  key:string,
  url:string,
  name:string,
  size:number
}

export type Offer = {
  user: User;
  offer?: { sdp?: string; type: "offer" };
  createdOffer?: { sdp?: string; type: "offer" };
  answer: { sdp?: string; type: "answer" };
  requestedUser?: User;
  receivedUser?: User;
};
export type Candidate = {
  iceCandidateBuffer: RTCIceCandidate[];
  guest: User;
  offerer: User;
};
type ObjectId = Types.ObjectId;
export type UserSchemaType = {
  _id?: any;
  name: string;
  createdAt?: Date;
  id?: string;
  socketID?: string;
  isConnected?: boolean;
  country?: string;
  profile?: string;
  age?: number;
  email: string;
  userName?: string;
  intrests?: string[];
  gender?: string;
  pronouns?: string;
  places_want_to_visit?: string[];
  sexuality?: string;
  languages_learning_or_speak?: string[];
};
export type photoSchematype = {
  key: string;
  imageUrl: string;
  caption?:string;
  tags?:string[];
  uploader: ObjectId;
  uploadedAt?: Date;
  urlExpirationTime: Date;
  likes?: [ObjectId];
};
export type UserType={
  name:string;
  profile:string;
  id:string
}
export type HandShakeDataType = {
  guest: UserType;
  offerer: UserType;
  offer?: { sdp?: string; type: "offer" };
  answer?: { sdp?: string; type: "answer" };
};