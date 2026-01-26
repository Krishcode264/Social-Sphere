"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      // 1. Check for Handoff Token in URL
      if (typeof window !== "undefined") {
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const handoffToken = hashParams.get("handoff");

        if (handoffToken) {
          try {
            console.log("Found handoff token, exchanging...");
            const res = await axios.post(
              `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/auth/exchange`,
              { handoff: handoffToken }
            );

            if (res.data?.token) {
              window.sessionStorage.setItem("token", res.data.token);
              // Clear hash from URL
              window.history.replaceState(null, "", " ");

              // Set user data from response
              if (res.data.user) {
                setUser((prev) => ({ ...prev, ...res.data.user }));
              }
              setIsAuthenticated({ isAuthenticated: true });
              setIsValid({ status: true, message: "Successfully logged in via handoff" });

              // Handle Redirect to Previous Route
              const previousRoute = window.sessionStorage.getItem("privousRoute");
              if (previousRoute) {
                console.log("Redirecting to previous route:", previousRoute);
                window.sessionStorage.removeItem("privousRoute");
                router.replace(previousRoute);
              }
            }
          } catch (error) {
            console.error("Token exchange failed", error);
            setIsValid({ status: false, message: "Token exchange failed" });
          }
        }
      }

      // 2. Validate Token (Existing or Just Exchanged)
      const token = typeof window !== "undefined" ? window.sessionStorage.getItem("token") : null;

      if (token) {
        try {
          console.log("Validating with sessionStorage token");
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/feed/getUserByToken`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (res.data?.user) {
            setUser((prev) => ({ ...prev, ...res.data.user }));
            setIsValid({ status: true, message: "success in fetching user" });
            setIsAuthenticated({ isAuthenticated: true });
          }
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            setIsValid({
              status: false,
              message: error.response.data.message || "You need to Authenticate",
            });
          }
        }
      } else {
        console.log("No token found in sessionStorage");
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

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
