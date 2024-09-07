import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserData } from "../mongoose/schemas/userSchema";
import type { User } from "../types/types";
async function checkTokenValidity(
  req: Request,
  res: Response,
  next: NextFunction
) {

 const token=req.cookies.token;

// console.log(token,"toekn at validate token",req.cookies,"here are the cookies " )
  if (!token) {
    return res.status(401).json({
      message: "You Need to Authenticate",
      redirect: "/login",
    });
  }
  const user = await tokenIsValid(token );

  if (user) {
  //  console.log(user,"user at check token validity ")
    // if (req.path == "/validateToken") {
    //   res.send(user);
    //   console.log("valid token");
    // } else {
    // console.log("token is here eeheh",token , "requested path",req.path)
    //updating socket id console.log("token is here eeheh",token , "requested path",req.path)
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
  //  console.log(decodeToken,"decoded token")
     if (decodeToken && Math.floor(Date.now() / 1000)>decodeToken.exp) {
    //   console.log("token expired ");
       return false
     }
    const user = await UserData.findById(decodeToken.id);
   // console.log(user,"user in tokenis valid ")
    if (user) {
      return { name: user.name, id: user._id.toString() };
    } return false
  } catch (err) {
    return false;
  }
}

export default checkTokenValidity;
