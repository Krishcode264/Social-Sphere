
import { ChatHeadContainer } from "@/components/messageView/Message-Server";


import './message.css'

export default function MessageComponentLayout({children}:{children:React.ReactNode}){


    return (
    
        <div className="  from-slate-950  to-slate-800 bg-gradient-to-br w-full  flex h-full ">
       
            <ChatHeadContainer />
          
           {children}
     
        </div>
  
    )
}