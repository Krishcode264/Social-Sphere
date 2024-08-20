"use client"
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
  useRef,
} from "react";
import { usePathname } from "next/navigation";

// Define the type for the context value
interface PathContextType {
  currentPath: string|undefined;
}

const PathContext = createContext<string | undefined>(undefined);

interface PathProviderProps {
  children: ReactNode;
}


export const PathProvider: React.FC<PathProviderProps> = ({ children }) => {
  const path = usePathname();
  const [currentPath,setCurrentPath] = useState(path);

  useEffect(() => {
    // console.log("path is chnaging ", path);
    // console.log(path)
   setCurrentPath(()=>path)

    
  }, [path]);

  // Use useMemo to avoid recreating the context value object on every render

  return <PathContext.Provider value={currentPath}>{children}</PathContext.Provider>;
};

// Custom hook to use the PathContext
export const usePath = ():string => {
  const context = useContext(PathContext);
  if (context === undefined) {
    throw new Error("usePath must be used within a PathProvider");
  }
  return context;
};
