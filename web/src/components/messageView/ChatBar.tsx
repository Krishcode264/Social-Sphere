import AddCircleIcon from "@mui/icons-material/AddCircle";
import { useEffect, useRef, useState } from "react";
import AddReactionIcon from "@mui/icons-material/AddReaction";
import GifBoxIcon from "@mui/icons-material/GifBox";
import SendIcon from "@mui/icons-material/Send";
export const ChatBar = () => {

  return (
    <div className="bg-slate-800  rounded-md  gap-2 shadow-sm sm:w-[90%] mx-auto   flex items-center px-2 py-1.5">
        <AddCircleIcon className="hover:text-orange-500 text-slate-600 hover:cursor-pointer mt-3 text-3xl" />
        <SearchBox />
        <SendIcon className="text-green-600  hover:text-green-700 hover:cursor-pointer mt-3 text-3xl" />
      

      <div className="flex gap-2 ml-auto  ">
        <AddReactionIcon className="text-slate-600 hover:text-orange-500 hover:cursor-pointer text-3xl " />
        <GifBoxIcon className="text-slate-600 hover:text-orange-500 hover:cursor-pointer  text-3xl " />
      </div>
    </div>
  );
};


const SearchBox=()=>{
    const [value,setValue]=useState("")
    const textareaRef=useRef<HTMLTextAreaElement>(null);
    useEffect(()=>{
 if (textareaRef.current ) {

   textareaRef.current.style.height = "auto";
   console.log(textareaRef.current.scrollHeight);
   textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
 }
    },[value])

    const handleTextAreaHeight = (
      event: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
      setValue(event.target.value);
    };
   
    return (
      <div className="w-[70%] md:w-[75%] mb-[-10px] ">
        <textarea
          ref={textareaRef}
          className="w-full holder_color m-0  text-xl resize-none outline-none  overflow-hidden bg-inherit text-slate-400"
          rows={1}
          value={value}
          placeholder="Message @Tibo"
          onChange={handleTextAreaHeight}
        
        />
      </div>
    );
}

