
export default function getTimeString(timeStamp:string,timeZone:string){
  const date=new Date(timeStamp);
  type Options = {
    year: "numeric" | "2-digit" | undefined;
    month: "numeric" | "2-digit" | undefined; 
    day: "numeric" | "2-digit" | undefined; 
    hour: "numeric" | "2-digit" | undefined; 
    minute: "numeric" | "2-digit" | undefined; 
    hour12: boolean;
  };
  const options:Options = {
    year: "2-digit",
    month: "2-digit", 
    day: "2-digit", 
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, 
  };
  return date.toLocaleString(timeZone, options );

}

