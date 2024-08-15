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
        <div className="h-full w-full flex  p-2 sm:p-5 py-2 bg-slate-900">
          <RecoilRoot>
        <QueryProvider>
              <AuthProvider>
                <SocketProvider>
                  <SideBar />
                  <div className="  rounded-lg   flex-1 h-full overflow-y-auto shadow-lg bg-gradient-to-br from-slate-900 to-slate-700 ">
                    <Wrapper>{children}</Wrapper>
                  </div>
                </SocketProvider>
              </AuthProvider>
            </QueryProvider>
          </RecoilRoot>
        </div>
      </body>
    </html>
  );
}
