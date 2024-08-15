
import { PcProvider } from "@/context/peerConnectionContext";
export default async function RoomsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
 
        <PcProvider>{children}</PcProvider>
    
  );
}
