"use client"
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import axios from "axios";
import { userBasicInfoState, UserPhotosState } from "@/store/atoms/user-atom";
import Cookies from "js-cookie";
interface AuthContextProps {
  isValid: { status: boolean; message: string };
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isValid, setIsValid] = useState({ status: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useRecoilState(userBasicInfoState);
  useEffect(() => {


 
    const validate = async () => {

      try {
    console.log("context is running")
  
    // const token = Cookies.get("token");   //not available in production
    //  console.log(token,"token at auth context")
    //     if(user.id){ 
    // setIsValid({ status: true, message: "success in fetching user" });

    //     }
        if( user.id){
          console.log("toke and userid both present", user.id)
           setIsValid({ status: true, message: "success in fetching user" });
        }

        // if(!token && !user.id){
        //      console.log("toke and userid both absent", token, user.id);
        //      setIsValid({ status: false, message: "you need to Authenticate.." });
        // }

        if (!user.id ) {
          console.log("request is goinh ")
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/feed/getUserByToken`,
           {withCredentials:true}
    
          );

          if (res.data?.user) {
            console.log(res.data.user,"user ")
            setUser((prev) => ({ ...prev, ...res.data.user }));
        
            setIsValid({ status: true, message: "success in fetching user" });
          } 
        } 
      } catch (error) {
     
        setIsValid({
          status: false,
          message: "Session has expired. Please login again.",
        });
      
      } finally {
        setIsLoading(false);
      }
    };

    validate();
  },[user]);

  return (
    <AuthContext.Provider value={{ isValid, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
