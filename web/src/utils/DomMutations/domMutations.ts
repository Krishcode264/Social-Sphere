"use client"
import s1 from "@/sounds/n1.mp3"
export const handleScrollDown = (ref: HTMLDivElement | null) => {
  if (ref) {
    const divSh = ref.scrollHeight;

    ref.scrollBy({ top: divSh, behavior: "smooth" });
  }
};

export class playSound {
  static audio = new Audio(s1);
  static play() {
    this.audio.volume=0.5
    this.audio.play();
  }
}
