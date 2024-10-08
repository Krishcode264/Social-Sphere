"use client";
import axios from "axios";

export type MsgFilesType = {
  src: File;
}[];

export const handleFileUploadToS3 = async (files: MsgFilesType,conversationId:string):Promise<{key:string,name:string,url:string}[]|null >=> {
try{
  const filesUploaded = await Promise.all(
    files.map(async (file) => {
      try {
        const preSigedUrlData = await axios.get(
          `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/uploads/getPresignedUrl`,
          {
            params: {
              fileName: file.src.name,
              type: file.src.type,
              conversationId,
            },
            withCredentials: true,
          }
        );
        console.log(preSigedUrlData.data, "presigned urls"); //url and key

        const { key, url } = preSigedUrlData.data;
        const sendToS3 = await axios.put(url, file.src);
        const isSave = await axios.post(
          `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/uploads/message/success`,
          {
            key,
          },
          { withCredentials: true }
        );
        console.log(isSave.data,"isSave.data")
        return { key, url: isSave.data.url, name: file.src.name };
      } catch {
        return null;
      }
    })
  );


  const successfulUploads = filesUploaded.filter((file) => file !== null);
  return successfulUploads.length > 0 ? successfulUploads : null;
}
catch(err){
return null
}

};
