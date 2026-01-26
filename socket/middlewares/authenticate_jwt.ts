import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserData } from "../mongoose/schemas/userSchema";
import type { User } from "../types/types";
async function checkTokenValidity(
  req: Request,
  res: Response,
  next: NextFunction
) {

  let token: string | undefined;

  const authHeader = req.headers.authorization;

  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  } else if (req.cookies && typeof req.cookies.token === "string") {
    // Fallback to cookie-based token for backward compatibility
    token = req.cookies.token;
  }

  if (!token) {
    console.log("token is not coming");
    return res.status(401).json({
      message: "You Need to Authenticate",
      redirect: "/login",
    });
  }
  // console.log("token in check token validity",token);
  const user = await tokenIsValid(token);

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
    console.log("token in token is valid", token);
    const decodeToken: any = jwt.decode(token);

    console.log(decodeToken, "decoded token");

    if (!decodeToken) {
      return false;
    }

    // Expiry check using the exp field from the JWT payload
    if (decodeToken.exp && Math.floor(Date.now() / 1000) > decodeToken.exp) {
      console.log("token expired");
      return false;
    }

    // We already have the user info in the token payload, no need to hit the DB
    if (decodeToken.id && decodeToken.name) {
      return { name: decodeToken.name, id: decodeToken.id };
    }

    return false;
  } catch (err) {
    return false;
  }
}

export default checkTokenValidity;
