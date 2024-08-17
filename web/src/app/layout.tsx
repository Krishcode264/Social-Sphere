import "./globals.css";

import RecoilRoot from "../utils/RecoilRoot";
interface LayoutProps {
  children: React.ReactNode;
}
import { SocketProvider } from "@/context/socketContext";
import { AuthProvider } from "@/context/authContext";
import SideBar from "@/components/homePage/SideBar";
import Wrapper from "./wrapper";
import { QueryProvider } from "@/context/queryContext";
import { PcProvider } from "@/context/peerConnectionContext";
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <head>
        <title>Social Sphere</title>
      </head>
      <body className="  h-screen ">
        <div className="h-full w-full flex   bg-slate-900">
          <RecoilRoot>
            <AuthProvider>
              <SocketProvider>
                <PcProvider>
                  <QueryProvider>
                    <SideBar />
                    <div className="  rounded-lg   flex-1 h-full overflow-y-auto shadow-lg bg-gradient-to-br from-slate-900 to-slate-700 ">
                      <Wrapper>{children}</Wrapper>
                    </div>
                  </QueryProvider>
                </PcProvider>
              </SocketProvider>
            </AuthProvider>
          </RecoilRoot>
        </div>
      </body>
    </html>
  );
}
