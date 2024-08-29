"use client"
import s1 from "@/sounds/n1.mp3"
export const handleScrollDown = (ref: HTMLDivElement | null) => {
  if (ref) {
    const divSh = ref.scrollHeight;

    ref.scrollBy({ top: divSh, behavior: "smooth" });
  }
};

export function playSound(){
if(typeof window ==="undefined") return 
const audio=new Audio(s1)
 audio.volume = 0.5;
 audio.play();
}

