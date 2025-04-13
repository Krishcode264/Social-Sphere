import "./globals.css";

import RecoilRoot from "../utils/RecoilRoot";
interface LayoutProps {
  children: React.ReactNode;
}
import { PathProvider } from "@/context/pathContext";
import { SocketProvider } from "@/context/socketContext";
import { AuthProvider } from "@/context/authContext";
import SideBar from "@/components/homePage/SideBar";
import Wrapper from "./wrapper";
import { QueryProvider } from "@/context/queryContext";
import { PcProvider } from "@/context/peerConnectionContext";
import Image from "next/image";
import logo from '@/images/logo.jpg'
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <head>
        <title>Social Sphere</title>
        <link rel="icon" href="@/images/logo.jpg" type="image/jpg"></link>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className="  h-screen w-screen">
        {/* <div className="w-full stickey  h-[5%] m-0 p-2 text-center  bg-slate-900 text-bold text-white ">
          The server might take some time to retrieve  data as the backend
          is hosted on a free Render instance
        </div> */}
        <div className="h-full w-full flex   bg-slate-900 relative">
          <RecoilRoot>
            <PathProvider>
              <AuthProvider>
                <SocketProvider>
                  <PcProvider>
                    <QueryProvider>
                      <SideBar />
                      <div className="relative p-1 overflow-y-auto   rounded-lg   flex-1 h-full   shadow-lg bg-gradient-to-br from-slate-900 to-slate-700 ">
                        <Wrapper>{children}</Wrapper>
                      </div>
                    </QueryProvider>
                  </PcProvider>
                </SocketProvider>
              </AuthProvider>
            </PathProvider>
          </RecoilRoot>
        </div>
      </body>
    </html>
  );
}
