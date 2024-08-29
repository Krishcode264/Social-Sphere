
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
import { InfoTemplate, InfoTemplateWithIntrests } from "./Ui";
import { boolean } from "zod";
import { Photo } from "@mui/icons-material";
export type CreatePostType={
  caption:string;
  tags:string[]|[];
  photo:any
}
export const UploadPhoto = () => {

  const addPhotoRef = useRef<null | HTMLInputElement>(null);
  const [uploading, setIsUploading] = useState<boolean>(false);
  const [post,setPost]=useState<CreatePostType>({caption:"",photo:null,tags:[]})
   const  setPhoto = useSetRecoilState(UserPhotosState);
   const [fileBlob,setFileBlob]=useState<string|null>(null)
  const handleAddIconClick = () => {
    if (addPhotoRef.current) {
      addPhotoRef?.current?.click();
    }
  };
const updatetags=(id:string,value:string,remove:boolean|undefined)=>{
  if(remove){
    setPost((prev)=>({...prev , tags:prev.tags.filter((t)=> t !== value)}))
    return
  }
 setPost((prev) => ({ ...prev, tags:[...prev.tags,value]}));
}


const handleSetPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
const files: any = e.target.files;
if(files[0]){
     setPost((prev)=>({...prev , photo:files[0]}))
  
}

};

useEffect(()=>{
  console.log("use effect running")
 if(post.photo){
  const blobUrl=URL.createObjectURL(post.photo);
  console.log(blobUrl,"blob url")
  setFileBlob(blobUrl)
 }

 return (()=>{
  URL.revokeObjectURL(post.photo)
 })
},[post.photo])

  const handleUploadPhoto = async () => {
    try {
    
      if (post.photo) {
          setIsUploading(true);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/uploads/getPresignedUrl`,
          {
            params: { fileName: post.photo.name, type:post.photo.type },

            withCredentials: true,
          }
        );
        const { url, key } = res.data;
       // console.log(url, key, "key and url from server");
        const sendTos3 = await axios.put(url, post.photo);
        console.log(sendTos3,"send to s3 response");
        const isSave = await axios.post(
          `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/uploads/success`,
          {
            key,
            caption:post.caption,
            tags:post.tags,
      
          },{withCredentials:true}
        );
        if (isSave.data.photo) {
          console.log(isSave.data.photo)
          setPhoto((prev) => [
            ...prev,
            { ...isSave.data.photo, id: isSave.data.photo._id},
          ]);
        }

        setIsUploading(false);
        setPost({photo:null,caption:"",tags:[]})
        setFileBlob(null)
      }
    } catch (err) {
      console.log("image upload failed", err);
      setIsUploading(false);
    }
  };
  return (
    <div className="w-full    p-4  text-slate-300  font-mono bg-slate-800 ">
      <span className="text-slate-200 py-1 px-1 text-xl bg-orange-600 rounded-sm  ">
        Create New Post
      </span>

      <div className="min-w-[300px]  p-3 gap-2 min-h-[350px] flex-col mx-auto my-4 rounded-sm  bg-slate-700 flex items-center justify-center">
       
        {fileBlob && (
          <Image
            src={fileBlob}
            width={5}
            height={5}
            alt="post image"
            className="w-[400px] h-[300px]  bg-contain "
          />
        )}

        <>
          <button className=" border border-blue-200 p-1 flex justify-center items-center flex-col   rounded-md    "
          disabled={uploading}
          >
            <AddIcon
              onClick={handleAddIconClick}
              className="hover:cursor-pointer hover:scale-110 "
              sx={{ fontSize: "50px" }}
            />
            <p className="font-semibold text-md ">Add photo</p>
            <p className="text-center font-thin text-sm text-blue-300">
              you can drag and drop the photo here
            </p>
          </button>
          <input
            onChange={(e) => handleSetPhoto(e)}
            ref={addPhotoRef}
            type="file"
            name=""
            id=""
            className="w-full h-full  hover:cursor-pointer hidden"
          />
        </>
      </div>
      <h5 className=" m-0 p-0">Add Tags</h5>

      <InfoTemplateWithIntrests
        intrests={post.tags}
        editable={true}
        id="tags"
        updater={updatetags}
        color="rgb(51 65 85)"
      />

      <h4 className="">Add caption </h4>
      <input
      disabled={uploading}
        type="text"
        onChange={(e) => {
          setPost((prev) => ({ ...prev, caption: e.target.value }));
        }}
        placeholder="add caption "
        className="py-1 mt-1 ml-2 px-1 rounded-lg    bg-slate-700 text-xl  w-full sm:w-[80%] "
      />

      <button onClick={handleUploadPhoto} disabled={uploading || !post.photo}  className="bg-blue-500 px-1.5 py-1.5 rounded-md m-2 w-full">
      
        {uploading ? (
          <div className="flex items-center gap-2 justify-center">
            <div
              className="animate-spin inline-block size-8 border-[3px] border-current border-t-transparent text-slate-200 rounded-full"
             
            ></div>
            <p className=" text-xl">Uploading...</p>
          </div>
        ) : (
          <p className=" align-center text-slate-200"> Upload Post</p>) }
      </button>
    </div>
  );
};

export  const  ImageGallary = () => {
  const [photos, setphotos] = useRecoilState(UserPhotosState);
  const {id}=useRecoilValue(userInfoState)
  async function getPhotos() {
    console.log("getPhotos running ");
    // const token=Cookies.get("token")
    const photos = await axios.get(
      `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/feed/getUserPhotos`,
      { 
        params:{id},
        withCredentials:true
          }
    );
    console.log(photos,"phtoos from image gallary at the user profile page ")
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
    <>
      {photos.length > 0 && renderPhotos(photos) }
      
    </>
  );
};
