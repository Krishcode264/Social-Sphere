
import { ChatHeadContainer } from ".";


export default function MessageComponentLayout({children}:{children:React.ReactNode}){
    return (
    
        <div className="  from-slate-950  to-slate-800 bg-gradient-to-br w-full  flex h-screen ">
       
            <ChatHeadContainer />
          
           {children}
     
        </div>
  
    )
}