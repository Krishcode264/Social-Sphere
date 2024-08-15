import { Schema } from "mongoose";
import mongoose from "mongoose";
export const userSchema = new Schema({
  name: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now, // Set default to current timestamp
  },
  userName:{type:String},
  pronouns:{type:String},
  password: { type: String },
  socketID: { type: String },
  email: { type: String ,unique:true},
  isConnected: { type: Boolean, default: false },
  country: { type: String, default: "" },
  intrests: { type: [String], default: [] },
  age: { type: Number, default: 0 },
  gender: { type: String, default: "unknown" },
  sexuality:{type:String},
  places_want_to_visit:{type:[String]},
  profile: { type: String },
  friends:{type:Schema.Types.ObjectId,ref:"User"},
  languages_learning_or_speak:{type:[String]},
  likedPhotos: [{type:Schema.Types.ObjectId, ref:"Photo"}],
  authType: {
    provider: { type: String },
    expires: {
      type: String,
    },
  },
});
export const UserData = mongoose.model("User", userSchema);


