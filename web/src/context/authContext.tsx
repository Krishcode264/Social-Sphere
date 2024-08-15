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
  const setPhotos = useSetRecoilState(UserPhotosState);

  useEffect(() => {
    const validate = async () => {

      try {
    
    const token = Cookies.get("token");
      console.log(token,"token at auth context")
        if (token && !user.id ) {
          console.log("request is goinh ")
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/feed/getUserByToken`,
           {withCredentials:true}
    
          );

          if (res.data?.user) {
            console.log(res.data.user,"user ")
            setUser((prev) => ({ ...prev, ...res.data.user }));
            setPhotos((prev) => [...res.data.photos]);
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
  },[]);

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
