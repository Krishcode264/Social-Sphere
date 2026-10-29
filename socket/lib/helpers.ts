import mongoose from "mongoose";

export const getObjectId = (id: string) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId();
  }
  return new mongoose.Types.ObjectId(id);
};