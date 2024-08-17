"use client"
import React, { useEffect, useRef, useState, type Ref } from 'react'
interface ChildrenProps {
  p: React.RefObject<HTMLDivElement>;
}

const Children: React.FC<ChildrenProps> = ({ p }) => {
  const [isVisible, setIsVisible] = useState(true);
  const childRef = useRef<HTMLDivElement | null>(null);
  const [topFromVt, setTopFromVt] = useState(0);
    
  useEffect(() => {
    const handleScroll = () => {
      console.log("Scroll event triggered");
      if (childRef.current) {
        const { top, height } = childRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        setTopFromVt(top);
        // Check if more than half of the element's height is out of view
        if (top + height / 2 < 0 || top > windowHeight) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      }
    };

    p.current?.addEventListener("scroll", handleScroll);
    handleScroll(); // Check visibility on mount

    return () => {
    p.current?.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <div ref={childRef} className="h-[200px] w-[80%] border-2 border-slate-950 relative ">
 
      <h1>{topFromVt.toFixed(2)}</h1>
      {topFromVt < -100 + 20  && (
        <div className="w-10 h-90 bg-rose-500 absolute bottom-0"> 50% above the frame </div>
      )}
    </div>
  );
};
const Demo = () => {




  const parentref = useRef<HTMLDivElement | null>(null);


  return (
    <div
      ref={parentref}
      className="border bg-slate-200  w-[100%]  overflow-scroll flex-col h-[500px] "
    >
      <Children key={1} p={parentref} />
      <Children key={2} p={parentref} />
      <Children key={3} p={parentref} />
      <Children key={4} p={parentref} />
      <Children key={5} p={parentref} />
      <Children key={6} p={parentref} />
    </div>
  );
}

export default Demo