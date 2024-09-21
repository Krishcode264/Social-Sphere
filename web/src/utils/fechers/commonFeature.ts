import axios from "axios"


export const CommonFetcher=async(path:string,query?:any)=>{
    console.log("common fetcher",path,query)
const data = await axios.get(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/${path}`,{
    params:query,
    withCredentials:true
});
return data.data
} 