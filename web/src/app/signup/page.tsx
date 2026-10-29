"use client";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import WorkspacesOutlinedIcon from "@mui/icons-material/WorkspacesOutlined";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { redirect, useRouter } from "next/navigation";
import { UserAuthState, userBasicInfoState, UserPhotosState } from "@/store/atoms/user-atom";
import { useSetRecoilState } from "recoil";
import googleLogo from '../images/google.png'
import Image from "next/image";
import googlePic from "@/images/google.png";
import { useEffect } from "react";
import { API } from "@/utils/axios";





const SignUpSchema = z.object({
  name: z.string().min(4),
  email: z.string().email(),
  password: z.string().min(8),
});
type FormFields = z.infer<typeof SignUpSchema>;
const Signup = () => {
  const Router = useRouter();
  const [isGuestSubmitting, setIsGuestSubmitting] = useState(false);
  const setUser = useSetRecoilState(userBasicInfoState);
  const setIsAuthenticated = useSetRecoilState(UserAuthState);
  const handleLoginWithGoogle = () => {
    const path = `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/auth/google`;
    window.location.href = path;
  };
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({ resolver: zodResolver(SignUpSchema) });

  const handleGuestLogin = async () => {
    try {
      setIsGuestSubmitting(true);
      const res = await API.post(`/auth/guest`, {}, { withCredentials: true });
      if (res.data.status === "success") {
        const { user, token } = res.data;
        setUser((prevUser) => ({ ...prevUser, ...user }));
        setIsAuthenticated({ isAuthenticated: true });
        if (token) {
          window.sessionStorage.setItem("token", token);
        }
        Router.replace("/");
      } else {
        setError("root", { message: res.data.message || "Guest login failed" });
      }
    } catch (err: any) {
      console.error("Guest login error:", err);
      setError("root", { message: "Could not log in as guest. Please try again." });
    } finally {
      setIsGuestSubmitting(false);
    }
  };



  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    if (process.env.NEXT_PUBLIC_SOCKET_SERVER_URL) {
      // console.log(data);
      const res = await API.post(`/auth/signup`, data, { withCredentials: true });
      if (res.data.status === "success") {
        const { user, token } = res.data;

        setUser((prevUser) => ({ ...prevUser, ...user }));
         setIsAuthenticated({ isAuthenticated: true });
      //  setPhotos((prev)=>([...prev]))

        if (token) {
          window.sessionStorage.setItem("token", token);
        }
        Router.replace("/")
      
      }
      
      if (res.data.status === "error") {
        setError("root", { message: res.data.message });
      }
    }
    }
 
  
 

  return (
    <div className="flex justify-center items-center h-full w-full font-mono">
      <div className="  rounded-lg w-full mb:w-[90%] md:w-[50%] sm:w-[50%] 2xl:w-[35%] xl:w-[30%] mx-auto mt-4  p-3 py-4">
        <h4 className=" mx-auto text-center text-2xl text-slate-400 p-2">
          Create Account
        </h4>
        <form
          action=""
          className="flex flex-col rounded-lg gap-5 p-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          <input
            {...register("name")}
            type="text"
            placeholder="Enter your name"
            className="p-2 rounded-lg text-xl bg-slate-700 text-slate-400"
          />
          {errors.name && (
            <p className="text-orange-500">{errors.name.message}</p>
          )}
          <input
            {...register("email")}
            type="email"
            placeholder="Enter email"
            className="p-2 rounded-lg text-xl text-slate-400 bg-slate-700"
          />
          {errors.email && (
            <p className="text-orange-500">{errors.email.message}</p>
          )}
          <input
            {...register("password")}
            type="password"
            placeholder="Enter password"
            className="p-2 rounded-lg text-xl text-slate-400 bg-slate-700"
          />
          {errors.password && (
            <p className="text-red-400 ">{errors.password.message}</p>
          )}
          <button
            disabled={isSubmitting || isGuestSubmitting}
            className="p-2 rounded-xl text-slate-200  bg-blue-600  hover:bg-blue-700 font-medium "
          >
            Create Account
            {isSubmitting && (
              <WorkspacesOutlinedIcon className="animate-spin" />
            )}
          </button>

          <button
            type="button"
            disabled={isSubmitting || isGuestSubmitting}
            onClick={handleGuestLogin}
            className="p-2.5 hover:bg-emerald-600 active:scale-[0.98] transition-all rounded-xl text-lg bg-emerald-500 text-white font-semibold flex items-center justify-center gap-2 shadow-md shadow-emerald-950/40"
          >
            {isGuestSubmitting ? (
              <>
                <WorkspacesOutlinedIcon className="animate-spin" />
                <span>Entering as Guest...</span>
              </>
            ) : (
              <>
                <AccountCircleIcon className="text-2xl" />
                <span>Sign in as Guest</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={isSubmitting || isGuestSubmitting}
            onClick={handleLoginWithGoogle}
            className="p-2 hover:bg-slate-700 rounded-xl text-xl bg-slate-800 text-slate-400 font-medium flex items-center justify-center gap-2"
          >
            <p className="">sign up with </p>
            <Image src={googlePic} className="w-24 mt-2" alt="google" />
          </button>

          {errors.root && (
            <p className="text-red-400  ">{errors.root.message}</p>
          )}
          <p className="text-slate-400 text-x">
            Alredy have account?
            <Link
              href="/login"
              className="text-blue-600  ml-1 hover:text-blue-700 "
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
