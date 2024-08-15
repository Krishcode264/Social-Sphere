import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserData } from "../mongoose/schemas/userSchema";
import type { User } from "../types/types";
async function checkTokenValidity(
  req: Request,
  res: Response,
  next: NextFunction
) {
  //  const authHeader = req.headers["authorization"];
  // const token = authHeader && authHeader.split(" ")[1]; // Extract Bearer token
// console.log(req.cookies,"cookies here from client ")
  // const origin = req.headers.origin; // May be present in CORS requests
  // const referer = req.headers.referer; // URL of the page making the request

  // console.log("Request Origin:", origin);
  // console.log("Request Referer:", referer);
// console.log("Cookies:", req.cookies);
 const token=req.cookies.token;
 console.log(token,"toekn at validate token",req.cookies,"here are the cookies ")
  if (!token) {
    return res.status(401).json({
      message: "Token is missing. Please log in again.",
      redirect: "/login",
    });
  }
  const user = await tokenIsValid(token );

  if (user) {
    // if (req.path == "/validateToken") {
    //   res.send(user);
    //   console.log("valid token");
    // } else {
      req.body.user = user;
      next();
  //  }
  } else {
    res.status(401).json({
      message: "Session has expired. Please login again.",
      redirect: "/login",
    });
  }
}

async function tokenIsValid(token: string): Promise<User | boolean> {
  try {
    const decodeToken: any = jwt.decode(token);
    console.log(decodeToken,"decoded token")
     if (decodeToken && Math.floor(Date.now() / 1000)>decodeToken.exp) {
       console.log("token expired ");
       return false
     }
    const user = await UserData.findById(decodeToken.id);
    console.log(user,"user in tokenis valid ")
    if (user) {
      return { name: user.name, id: user._id.toString() };
    } return false
  } catch (err) {
    return false;
  }
}

export default checkTokenValidity;
