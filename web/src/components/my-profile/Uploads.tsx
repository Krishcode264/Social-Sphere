import { userBasicInfoState, UserPhotosState } from "@/store/atoms/user-atom";
import type { PhotoType } from "@/types/types";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useSetRecoilState, useRecoilValue, useRecoilState } from "recoil";
import AddIcon from "@mui/icons-material/Add";
import Image from "next/image";
import PostView from "../profile/postView";
import { userInfoState } from "@/store/selectors/user-selector";
import Cookies from "js-cookie";

export const UploadPhoto = () => {
  const addPhotoRef = useRef<null | HTMLInputElement>(null);
  const [uploading, setIsUploading] = useState<boolean>(false);
  const setPhoto = useSetRecoilState(UserPhotosState);

  const handleAddIconClick = () => {
    if (addPhotoRef.current) {
      addPhotoRef?.current?.click();
    }
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      const token =window.sessionStorage.getItem("token")  // if user logged in as credential methode 
      const userToken=Cookies.get("token")  //if user logged in with google auth
      const files: any = e.target.files;
      if (files[0]) {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/uploads/getPresignedUrl`,
          {
            params: { fileName: files[0].name, type: files[0].type },

            withCredentials: true,
          }
        );
        const { url, key } = res.data;
       // console.log(url, key, "key and url from server");
        const sendTos3 = await axios.put(url, files[0]);
       // console.log(sendTos3);
        const isSave = await axios.get(
          `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/uploads/success`,
          {
            params: { key },
            withCredentials: true,
          }
        );
        if (isSave.data.photo) {
          setPhoto((prev) => [...prev, isSave.data.photo]);
        }

        setIsUploading(false);
      }
    } catch (err) {
      console.log("image upload failed", err);
      setIsUploading(false);
    }
  };
  return (
    <div className="w-[240px] h-[240px] md:w-[300px] md:h-[300px]">
      <button className="w-full h-full flex justify-center items-center flex-col shadow-lg bg-slate-200 rounded-xl hover:text-green-700 ">
        {uploading ? (
          <>
            <div
              className="animate-spin inline-block size-8 border-[3px] border-current border-t-transparent text-blue-600 rounded-full dark:text-blue-500"
              role="status"
              aria-label="loading"
            ></div>
           <p className="mt-3">Uploading</p>
          </>
        ) : (
          <>
            <AddIcon
              onClick={handleAddIconClick}
              className="hover:cursor-pointer hover:scale-110 "
              sx={{ fontSize: "50px" }}
            />
            <p className="font-semibold text-xl">Add photo</p>
          </>
        )}
      </button>
      <input
        onChange={(e) => handleUploadPhoto(e)}
        ref={addPhotoRef}
        type="file"
        name=""
        id=""
        className="w-full h-full  hover:cursor-pointer hidden"
      />
    </div>
  );
};

export  const  ImageGallary = () => {
  const [photos, setphotos] = useRecoilState(UserPhotosState);
  async function getPhotos() {
    console.log("getPhotos running ");
    const token=Cookies.get("token")
    const photos = await axios.get(
      `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/feed/getUserPhotos`,
      {  headers: {
              Authorization: `Bearer ${token}`,
            },
          }
    );
    setphotos(photos.data);
  }
  useEffect(() => {
    if (photos.length > 0) {
      return;
    }
    getPhotos();
  }, []);


  function renderPhotos(arr: PhotoType[]) {
    return arr.map((photo) => {
      return <PostView photo={photo} key={photo.id} userId=""/>;
    });
  }
  return (
    <div className="flex flex-wrap w-full justify-around gap-2  p-2 bg-slate-900 rounded-lg">
      {photos.length > 0 && renderPhotos(photos)}
      <UploadPhoto />
    </div>
  );
};
