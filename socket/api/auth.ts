import express, { Request, Response } from "express";
export const authRouter = express.Router();
import { PhotosData } from "../mongoose/schemas/photoSchema";
import UserService from "../Services/UserService/userService";
import { UserData } from "../mongoose/schemas/userSchema";
import jwt from "jsonwebtoken";
import axios from "axios";
const NEXT_PUBLIC_SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${NEXT_PUBLIC_SOCKET_SERVER_URL}/auth/callback/google`; //http://localhost:8080/auth/callback/google";
const WEB_CLIENT_URL = process.env.WEB_CLIENT_URL as string;
const TOKEN_DOMAIN = process.env.TOKEN_DOMAIN;

const sanitizeUserData = (user: any) => {
  const {
    password,
    socketId,
    isConnected,
    authType,
    createdAt,
    _id,
    ...sanitizedUser
  } = user.toObject();
  return { ...sanitizedUser, id: _id.toString() };
};
const generateToken = (data: any) => {
  const secretKey = process.env.JWT_SECRET as string;
  const token = jwt.sign(data, secretKey, { expiresIn: "7h" });

  return token;
};
const handleUserSignup = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  // console.log(email, password, name);
  try {
    const alreadyExistedUserWithSameEmail =
      await UserService.checkUserAlreadyExist(email);
    // console.log(alreadyExistedUserWithSameEmail);
    if (alreadyExistedUserWithSameEmail.length === 0) {
      const createdUser = await UserService.saveUserData(req.body, {
        provider: "credencial",
      });
      if (createdUser) {
        const token = generateToken({
          name: createdUser.name,
          id: createdUser._id,
          profile: createdUser.profile,
        });
        res.cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite:"lax",
          domain: TOKEN_DOMAIN,
        });
        res.send({
          status: "success",
          message: "successfully signed up",
          user: sanitizeUserData(createdUser),
        });
      }
    } else {
      res.send({
        status: "error",
        message: "user with email alredy exist try login",
      });
    }
  } catch (err) {
    console.log(err, "err saving user");
    res.send({ status: "error", message: "something went wrong" });
  }
};

const handleUserLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const userwithEmail = await UserData.findOne({ email });

  if (userwithEmail) {
    if (userwithEmail.authType?.provider !== "credencial") {
      return res.send({
        status: "error",
        message:
          "You tried signing in with a different authentication method than the one you used during signup",
      });
    }
    if (userwithEmail.password === password) {
      const token = generateToken({
        name: userwithEmail.name,
        id: userwithEmail._id,
        profile: userwithEmail.profile,
      });
      // console.log(sanitizeUserData(userwithEmail), "sanitized user data");
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        domain: TOKEN_DOMAIN,
      }); //for developement
      //only sending token
      return res.send({
        status: "success",
        message: "successfully logged in",
        user: sanitizeUserData(userwithEmail),
      });
      //  res.redirect(WEB_CLIENT_URL)
      //return res.send({ status: "success", message: "successfully logged in" });
    } else {
      return res.send({
        status: "error",
        message: "password is incorrect",
      });
    }
  } else {
    return res.send({
      status: "error",
      message: "user with email does not exist",
    });
  }
};

async function googleLogin(req: Request, res: Response) {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email`;
  res.redirect(authUrl);
}

async function handleGoogleCallback(req: Request, res: Response) {
  const code = req.query.code;
  console.log(code, "got the code at callback");
  try {
    console.log(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, "here are all secrets");
    const response = await axios.post(
      "https://oauth2.googleapis.com/token",
      null,
      {
        params: {
          code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          grant_type: "authorization_code",
        },
        withCredentials: true,
      }
    );
    const { access_token } = response.data;
    console.log(access_token,"accesstoken in res.data ")
    const userInfo = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );
    const user = userInfo.data;
    console.log(user,"got user from acess tokemn")
    //  console.log(user,"got user from gogole heyyyyyy")
    const alreadyExistedUserWithSameEmail =
      await UserService.checkUserAlreadyExist(user.email);

    if (alreadyExistedUserWithSameEmail.length === 0) {
      //   console.log("creating new user from google auth")
      const createdUser = await UserService.saveUserData(
        {
          email: user.email as string,
          name: user.name as string,
          profile: user.picture,
        },
        {
          provider: "google",
        }
      );
      if (createdUser) {
        const token = generateToken({
          name: createdUser.name,
          id: createdUser._id,
          profile: createdUser.profile,
        });

        res.cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          domain: TOKEN_DOMAIN,
        });
        // res.send({user:createdUser})
        res.redirect(WEB_CLIENT_URL);
      }
    }
    if (alreadyExistedUserWithSameEmail.length > 0) {
      const user = alreadyExistedUserWithSameEmail[0]; //we could check if user.authType.provider ==="google" if not tell them to lognin with previously looged in methode as "credential"
      const token = generateToken({
        name: user.name,
        id: user._id,
        profile: user.profile,
      });
      // console.log("user alredy exist");
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        domain: TOKEN_DOMAIN,
      });
      res.redirect(WEB_CLIENT_URL);
    }
  } catch (error) {
    res.redirect(`${WEB_CLIENT_URL}/login`);
    console.error( "got eeror in gogole callback");
  }
}

const handleUserLogout = (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    domain: TOKEN_DOMAIN,
  });
  res.status(200).send("Logged out successfully");
};

authRouter.post("/signup", handleUserSignup);
authRouter.post("/login", handleUserLogin);
authRouter.post("/logout", handleUserLogout);
authRouter.get("/google", googleLogin);
authRouter.get("/callback/google", handleGoogleCallback);
authRouter.get("/health", (req, res) => {
  return res.send("auth/health goood");
});
