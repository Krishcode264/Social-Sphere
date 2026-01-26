"use server";
import type { MessageHistoryResponse } from "@/app/messages";
import type { ConvoType, User, UserSchemaType } from "@/types/types";
import axios from "axios";
import { cookies, headers } from "next/headers";
import { cache } from "react";

//dont need to pass explicit token anymore issue resolved , keep in mind dont call server actions inside tanstak query :)))))

// Get raw JWT token from cookie (if present)
export const token = async (): Promise<string | undefined> => {
  try {
    const cookieStore = cookies();
    const tokenCookie = cookieStore.get("token")?.value;
    // Ensure we return a string, not a Promise
    if (typeof tokenCookie === "string") {
      return tokenCookie;
    }
    return undefined;
  } catch (err) {
    console.error("Error getting token from cookies:", err);
    return undefined;
  }
};
//feed
export const getFeedUsers = cache(async () => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/feed/getFeedUsers`
    );

    return res.data;
  } catch (err) {
    return [];
  }
});
//profile
//profile
export const getUser =
  async (id: string, token?: string): Promise<UserSchemaType | null> => {
    // console.log(id,"id in get user at server action")
    try {
      const authToken = token;
      const authHeader = authToken ? `Bearer ${authToken}` : "";

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/feed/getUser`,
        {
          params: { id },
          headers: {
            Authorization: authHeader,
          },
        }
      );
      return res.data;
    } catch (err) {
      console.log("something went wron gin getuser actiom to feed/getUser server action");
      return null;
    }
  }


export const getUserPhotos = async (id: string, token?: string) => {
  const authToken = token;
  // console.log("token at get user photos", authToken);
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/feed/getUserPhotos`,
      {
        params: { id },
        headers: {
          Authorization: authToken ? `Bearer ${authToken}` : "",
        },
      }
    );
    // console.log(res,"user photos ")

    return res.data;
  } catch (err) {
    console.log("err in get user photos ");
    return [];
  }
};

//on reload it will run in auth context
//on reload it will run in auth context
export const getUserByToken = cache(async (token?: string) => {
  try {
    const authToken = token;
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/feed/getUserByToken`,
      {
        headers: {
          Authorization: authToken ? `Bearer ${authToken}` : "",
        },
      }
    );

    return res.data;
  } catch (err) {
    console.log("somethingwent wrong with fethching the user ");
    return null;
  }
});
//user profile
//user profile
export const getPhotosbyUserId = cache(async (userId: string, token?: string) => {
  console.log("getPhotos running ");
  const authToken = token;
  const photos = await axios.get(
    `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/feed/getUserPhotos`,
    {
      params: { id: userId },
      headers: {
        Authorization: authToken ? `Bearer ${authToken}` : "",
      },
    }
  );
  return photos.data;
});

// post comments
export const fetchCommentsForPost = async (photoId: string) => {
  const authToken = await token();
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/post-events/getComments`,
    {
      params: { id: photoId },
      headers: {
        Authorization: authToken ? `Bearer ${authToken}` : "",
      },
    }
  );
  // console.log(res,"fetch comments res here ");
  return res.data;
};

// export const addComment = async (data: any) => {
//   const res = await axios.get(
//     `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/post-events/postComment`,
//     {
//       ...data,
//       withCredentials: true,
//       Cookie: await token(),
//     }
//   );
// };


//  cant use this for now , client request with tanstak showing error with server actions 
const handlePostComm = async (
  photoId: string,
  userId: string,
  data: any
): Promise<any | null> => {
  console.log("handlepost runnuing ");
  try {
    console.log("handlepost runnuing ");
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/post-events/postComment`,
      {
        params: { photoId, userId },
        body: { content: data.input, photo: data.profile },
        // headers: {
        //   Cookie: await  token(), // Set the token in the Cookie header
        // },
        // withCredentials: true,
      }
    );
    return res.data;
  } catch (e) {
    console.log("err in posting comments ");
    return null;
  }
};

//messages

export const fetchMessageHistory = async (
  id: string,
  token?: string
): Promise<MessageHistoryResponse | null> => {
  try {
    console.log("fetch message history running")
    const authToken = token;
    const messageHistoryResponse = await axios.get(
      `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/message/getMessageHistory`,
      {
        params: { guestId: id },
        headers: {
          Authorization: authToken ? `Bearer ${authToken}` : "",
        },
      }
    );
    //  console.log("sending message History")
    return messageHistoryResponse.data;
  } catch (err) {
    console.log("errr in messages feature");
    return null;
  }
};

export const getUserConvos = async (token?: string): Promise<ConvoType[] | []> => {
  try {

    const authToken = token;
    const userConvos = await axios.get(
      `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/message/getConvos`,
      {
        headers: {
          Authorization: authToken ? `Bearer ${authToken}` : "",
        },
      }
    );
    return userConvos.data.data;
  } catch (err) {
    console.log("errr in fetching convos ");
    return [];
  }
}



