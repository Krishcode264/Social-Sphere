"use server";
import type { MessageHistoryResponse } from "@/app/messages";
import type { ConvoType, User, UserSchemaType } from "@/types/types";
import axios from "axios";
import Cookies from "js-cookie";
import { cookies } from "next/headers";
import { cache } from "react";

//dont need to pass explicit token anymore issue resolved , keep in mind dont call server actions inside tanstak query :)))))

//getcookietoken
export const token =() => {
  const cookieStore =  cookies();
  const token = cookieStore.get("token")?.value;
  //  console.log(token,"here is token at token methode ")
  return `token=${token}`;
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
export const getUser = cache(
  async (id: string): Promise<UserSchemaType | null> => {

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/feed/getUser`,
        {
          params: { id },
          headers: {
            Cookie:await token(), // Set the token in the Cookie header
          },
          withCredentials: true,
        }
      );
      console.log(res.data, "res .data in getuser");
      return res.data;
    } catch (err) {
      console.log("something went wron gin getuser actiom to feed/getUser");
      return null;
    }
  }
);

export const getUserPhotos = cache(async (id: string) => {
     console.log("token at get user phtoso",await token())
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/feed/getUserPhotos`,
      {
        params: { id },
        headers: {
          Cookie:await token(), // Set the token in the Cookie header
        },
        withCredentials: true,
      }
    );
    // console.log(res,"user photos ")

    return res.data;
  } catch (err) {
    console.log("err in get user photos ");
    return [];
  }
});

//on reload it will run in auth context
export const getUserByToken = cache(async () => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/feed/getUserByToken`,
      {
        // headers: {
        //   Cookie: await token(), // Set the token in the Cookie header
        // },
        withCredentials: true,
      }
    );

    return res.data;
  } catch (err) {
    console.log("somethingwent wrong with fethching the user ");
    return null;
  }
});
//user profile
export const getPhotosbyUserId = cache(async (userId: string) => {
  console.log("getPhotos running ");
  const photos = await axios.get(
    `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/feed/getUserPhotos`,
    {
      params: { id: userId },
      headers: {
        Cookie: await token(), // Set the token in the Cookie header
      },
      withCredentials: true,
    }
  );
  return photos.data;
});

// post comments
export const fetchCommentsForPost = async (photoId: string) => {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/post-events/getComments`,
    {
      params: { id: photoId },
      headers: {
        Cookie: await token(), // Set the token in the Cookie header
      },
      withCredentials: true,
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
        withCredentials: true,
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
  id: string
): Promise<MessageHistoryResponse | null> => {
  try {
   // console.log(id)
    const messageHistoryResponse = await axios.get(
      `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/message/getMessageHistory`,
      {
        params: { guestId: id },
      
         headers:{ Cookie: await token()},  // Set the token in the Cookie header
      
        withCredentials: true,
      }
    );
  //  console.log("sending message History")
    return messageHistoryResponse.data;
  } catch (err) {
    console.log("errr in messages feature");
    return null;
  }
};

export const getUserConvos=async():Promise<ConvoType[]|[]>=>{
try {

  const userConvos = await axios.get(
    `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/message/getConvos`,
    {
      headers: { Cookie: await token() }, // Set the token in the Cookie header
      withCredentials: true,
    }
  );
  return userConvos.data.data;
} catch (err) {
  console.log("errr in fetching convos ");
  return [];
}
}

