"use client";
import { API } from "@/utils/axios";
import axios from "axios";

export type MsgFilesType = {
  src: File;
}[];

export const handleFileUploadToS3 = async (
  files: MsgFilesType,
  conversationId: string
): Promise<{ key: string; name: string; url: string; urlExpirationTime: string }[] | null> => {
  try {
    const filesUploaded = await Promise.all(
      files.map(async (file) => {
        try {
          const preSigedUrlData = await API.get(
            `/uploads/getPresignedUrl`,
            {
              params: {
                fileName: file.src.name,
                type: file.src.type,
                conversationId,
              },
            }
          );
          console.log(preSigedUrlData.data, "presigned urls"); //url and key

          const { key, url } = preSigedUrlData.data;
          // Use vanilla axios to bypass API interceptor that adds Bearer token
          const sendToS3 = await axios.put(url, file.src, {
            headers: {
              "Content-Type": file.src.type
            }
          });
          const isSave = await API.post(
            `/uploads/message/success`,
            {
              key,
            }
          );
          console.log(isSave.data, "isSave.data");
          return {
            key,
            url: isSave.data.url,
            name: file.src.name,
            urlExpirationTime: isSave.data.urlExpirationTime || new Date(Date.now() + 604800 * 1000).toISOString()
          };
        } catch {
          return null;
        }
      })
    );

    const successfulUploads = filesUploaded.filter((file) => file !== null) as {
      key: string;
      name: string;
      url: string;
      urlExpirationTime: string;
    }[];
    return successfulUploads.length > 0 ? successfulUploads : null;
  } catch (err) {
    return null;
  }
};
