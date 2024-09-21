import mongoose, { Schema } from "mongoose";

export const TemporaryFilesinS3Schema=new mongoose.Schema({
    uploader:{type:Schema.Types.ObjectId, ref:"User"},
    file:{key:{type:String}}
},{timestamps:true})


export const TemporaryFilesinS3Data=mongoose.model("TempFilesS3",TemporaryFilesinS3Schema)