import axios from "axios";

export const API = axios.create({
  baseURL:process.env.NEXT_PUBLIC_SOCKET_SERVER_URL,
  headers: {
    "Content-Type": "application/json", 
    Accept: "application/json",
  },
  withCredentials: true, 
});
