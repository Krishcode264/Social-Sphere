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
    const checkHandoff = async () => {
      if (typeof window === "undefined") return;

      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const handoffToken = hashParams.get("handoff");

      if (handoffToken) {
        try {
          // Exchange handoff token for real access token
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
          }
        } catch (error) {
          console.error("Token exchange failed", error);
          // Optional: redirect to login or show error
        }
      }
    };

    checkHandoff();
  }, []);

  useEffect(() => {
    const validate = async () => {
      try {
        if (user.id && userAuthState.isAuthenticated) {
          console.log("toke and userid both present", user.id);
          setIsValid({ status: true, message: "success in fetching user" });
          return; // Skip further validation if already authenticated
        }

        // Prioritize token from sessionStorage
        const token = typeof window !== "undefined" ? window.sessionStorage.getItem("token") : null;

        if (token) {
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
            console.log(res.data.user, "user found via token");
            setUser((prev) => ({ ...prev, ...res.data.user }));

            setIsValid({ status: true, message: "success in fetching user" });
            setIsAuthenticated({ isAuthenticated: true });
          }
        } else {
          // Fallback to cookie-based check (optional, or remove if fully migrating)
          // For now, keeping it might help with transition, but if the goal is strict token auth:
          console.log("No token found in sessionStorage");
          setIsLoading(false);
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
