"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import axios, { AxiosError, AxiosResponse } from "axios";
import {
  UserAuthState,
  userBasicInfoState,
  UserPhotosState,
} from "@/store/atoms/user-atom";
import Cookies from "node_modules/@types/js-cookie";
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
  const [userAuthState, setIsAuthenticated] = useRecoilState(UserAuthState);
  useEffect(() => {
    const validate = async () => {
      try {
        if (user.id && userAuthState.isAuthenticated) {
          console.log("toke and userid both present", user.id);
          setIsValid({ status: true, message: "success in fetching user" });
        }

        if (!user.id && userAuthState.isAuthenticated === false) {
          console.log("request is goinh ");
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/feed/getUserByToken`,
            { withCredentials: true }
          );

          if (res.data?.user) {
            console.log(res.data.user, "user ");
            setUser((prev) => ({ ...prev, ...res.data.user }));

            setIsValid({ status: true, message: "success in fetching user" });
            setIsAuthenticated({ isAuthenticated: true });
          }
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            setIsValid({
              status: false,
              message:
                error.response.data.message || "You need to Authenticate",
            });
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    validate();
  }, [userAuthState.isAuthenticated]);

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
