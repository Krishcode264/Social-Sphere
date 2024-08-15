"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { redirect, useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { z } from "zod";
import axios from "axios";
import { userBasicInfoState } from "@/store/atoms/user-atom";
import Link from "next/link";
import WorkspacesOutlinedIcon from "@mui/icons-material/WorkspacesOutlined";
import googlePic from "@/images/google.png";
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
import Image from "next/image";
import { userInfo } from "os";
import { userInfoState } from "@/store/selectors/user-selector";


type FormFields = z.infer<typeof LoginSchema>;

const Login = () => {
  const Router = useRouter();

  const setUser = useSetRecoilState(userBasicInfoState);
  const {id}=useRecoilValue(userInfoState)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({ resolver: zodResolver(LoginSchema) });

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    if (process.env.NEXT_PUBLIC_SOCKET_SERVER_URL) {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/auth/login`,
        data
      );
      if (res.data.status === "success") {
        const { token , user } = res.data;
        sessionStorage.setItem("token", token);
        console.log(user,"got user ")
        setUser((prevUser) => ({
          ...prevUser,
          ...user
        }));

        Router.replace("/");
      }
      if (res.data.status === "error") {
        setError("root", { message: res.data.message });
      }
    }
  };
if(id){
  Router.back()
}
const path = `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/auth/google`;
function handleLoginWithGoogle() {
window.location.href = path
}
  return (
    <div className="flex justify-center items-center h-full w-full font-mono ">
      <div className="rounded-lg  w-full mb:w-[90%] md:w-[50%] 2xl:w-[35%] xl:w-[30%] mx-auto mt-4 p-3 py-4  ">
        <h4 className="mx-auto text-center text-2xl text-slate-400 p-2">
          Sign in
        </h4>
        <form
          className="flex flex-col rounded-lg gap-5 p-2  "
          onSubmit={handleSubmit(onSubmit)}
        >
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
            disabled={isSubmitting}
            type="submit"
            className="p-2 rounded-xl text-xl hover:bg-blue-700 text-slate-100 bg-blue-600 font-medium "
          >
            Login
            {isSubmitting && (
              <WorkspacesOutlinedIcon className="animate-spin" />
            )}
          </button>
          <button
             type="button"
             disabled={isSubmitting}
            data-onsuccess="onSignIn"
            onClick={handleLoginWithGoogle}
             className="g-signin2 p-2 hover:bg-slate-700 rounded-xl text-xl bg-slate-800 text-slate-400 font-medium flex items-center justify-center gap-2"
          >
            <p>Login with </p>
            <Image src={googlePic} className="w-24 mt-2" alt="google" />
          </button>
          {errors.root && (
            <p className="text-red-400 ">{errors.root.message}</p>
          )}
          <p className="text-slate-400 text-x">
            Dont have an account?
            <Link
              href="/signup"
              className="text-blue-600  ml-1 hover:text-blue-700 "
            >
              Signup
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
