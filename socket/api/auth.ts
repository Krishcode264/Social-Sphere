import express, { Request, Response } from "express";
export const authRouter = express.Router();
import { PhotosData } from "../mongoose/schemas/photoSchema";
import UserService from "../Services/UserService/userService";
import { UserData } from "../mongoose/schemas/userSchema";
import jwt from "jsonwebtoken";
import axios from "axios";
import { config, configDotenv } from "dotenv";
config();

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
  // Extended expiry for easier testing; adjust down for production if needed
  const token = jwt.sign(data, secretKey, { expiresIn: "3d" });

  return token;
};

const generateHandoffToken = (data: any) => {
  const secretKey = process.env.JWT_SECRET as string;
  return jwt.sign({ ...data, type: "handoff" }, secretKey, { expiresIn: "60s" });
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
          sameSite: "none",
          path: "/",
        });
        res.send({
          status: "success",
          message: "successfully signed up",
          user: sanitizeUserData(createdUser),
          token,
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
        path: "/",
      }); //for developement
      //only sending token
      return res.send({
        status: "success",
        message: "successfully logged in",
        user: sanitizeUserData(userwithEmail),
        token,
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
    console.log(access_token, "accesstoken in res.data ")
    const userInfo = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );
    const user = userInfo.data;
    console.log(user, "got user from acess tokemn")
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
        const handoffToken = generateHandoffToken({
          name: createdUser.name,
          id: createdUser._id,
          profile: createdUser.profile,
        });

        // Redirect with handoff token in hash
        res.redirect(`${WEB_CLIENT_URL}/#handoff=${handoffToken}`);
      }
    }
    if (alreadyExistedUserWithSameEmail.length > 0) {
      const user = alreadyExistedUserWithSameEmail[0]; //we could check if user.authType.provider ==="google" if not tell them to lognin with previously looged in methode as "credential"
      const handoffToken = generateHandoffToken({
        name: user.name,
        id: user._id,
        profile: user.profile,
      });

      // Redirect with handoff token in hash
      res.redirect(`${WEB_CLIENT_URL}/#handoff=${handoffToken}`);
    }
  } catch (error) {
    res.redirect(`${WEB_CLIENT_URL}/login`);
    console.error("got eeror in gogole callback");
  }
}

const handleTokenExchange = async (req: Request, res: Response) => {
  const { handoff } = req.body;

  if (!handoff) {
    return res.status(400).send({ status: "error", message: "No handoff token provided" });
  }

  try {
    const secretKey = process.env.JWT_SECRET as string;
    const decoded: any = jwt.verify(handoff, secretKey);

    if (decoded.type !== "handoff") {
      return res.status(400).send({ status: "error", message: "Invalid token type" });
    }

    // Generate real access token
    const token = generateToken({
      name: decoded.name,
      id: decoded.id,
      profile: decoded.profile,
    });

    return res.send({
      status: "success",
      message: "successfully exchanged token",
      user: {
        name: decoded.name,
        id: decoded.id,
        profile: decoded.profile,
        // Re-fetch user if needed for fuller object, but this suffices for context
      },
      token,
    });

  } catch (err) {
    return res.status(401).send({ status: "error", message: "Invalid or expired handoff token" });
  }
};

const handleUserLogout = (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  res.status(200).send("Logged out successfully");
};

const handleGuestLogin = async (req: Request, res: Response) => {
  try {
    let guestUser = await UserData.findOne({ email: DUMMY_GUEST_USER.email });

    if (!guestUser) {
      guestUser = await UserData.create(DUMMY_GUEST_USER);
    } else {
      // Ensure existing guest profile has rich metadata populated
      if (!guestUser.intro || !guestUser.intrests?.length) {
        guestUser.intro = DUMMY_GUEST_USER.intro;
        guestUser.intrests = DUMMY_GUEST_USER.intrests;
        guestUser.places_want_to_visit = DUMMY_GUEST_USER.places_want_to_visit;
        guestUser.languages_learning_or_speak = DUMMY_GUEST_USER.languages_learning_or_speak;
        guestUser.profile = guestUser.profile || DUMMY_GUEST_USER.profile;
        guestUser.country = guestUser.country || DUMMY_GUEST_USER.country;
        guestUser.pronouns = guestUser.pronouns || DUMMY_GUEST_USER.pronouns;
        await guestUser.save();
      }
    }

    // Ensure sample posts exist for guest user
    try {
      const existingPhotos = await PhotosData.find({ uploader: guestUser._id });
      if (existingPhotos.length === 0) {
        for (const photo of DUMMY_GUEST_PHOTOS) {
          await PhotosData.create({
            ...photo,
            uploader: guestUser._id,
            likes: [],
            comments: [],
          });
        }
      }
    } catch (photoErr) {
      console.warn("Could not seed dummy photos for guest user:", photoErr);
    }

    const token = generateToken({
      name: guestUser.name,
      id: guestUser._id,
      profile: guestUser.profile,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    return res.send({
      status: "success",
      message: "Successfully logged in as guest",
      user: sanitizeUserData(guestUser),
      token,
    });
  } catch (err) {
    console.error("Guest login failed:", err);
    return res.status(500).send({
      status: "error",
      message: "Failed to sign in as guest. Please try again.",
    });
  }
};

const DUMMY_GUEST_USER = {
  name: "Guest Explorer",
  userName: "guest_explorer",
  email: "guest@socialsphere.demo",
  pronouns: "They/Them",
  intro: "Welcome to Social-Sphere! 🚀 I'm a guest explorer account for recruiters, hiring managers, and visitors to test out real-time WebRTC video calls, chat, presence, and interactive feeds.",
  country: "United States",
  age: 26,
  gender: "Non-binary",
  sexuality: "Open",
  intrests: [
    "Full-Stack Engineering",
    "React & Next.js",
    "WebRTC Video & Audio",
    "System Design",
    "UI/UX Design",
    "Open Source",
    "Photography",
  ],
  places_want_to_visit: [
    "Tokyo, Japan",
    "San Francisco, USA",
    "Reykjavik, Iceland",
    "Zurich, Switzerland",
    "Kyoto, Japan",
  ],
  languages_learning_or_speak: [
    "English (Fluent)",
    "Spanish (Conversational)",
    "Japanese (Learning)",
  ],
  profile: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
  authType: {
    provider: "guest",
  },
};

const DUMMY_GUEST_PHOTOS = [
  {
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    key: "guest_sample_1",
    caption: "Exploring Yosemite Valley at sunset 🌄 #nature #travel #hiking",
    tags: ["nature", "travel", "hiking"],
    urlExpirationTime: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80",
    key: "guest_sample_2",
    caption: "Late night coding sessions & building real-time WebRTC apps 💻⚡ #developer #react #coding",
    tags: ["developer", "react", "coding"],
    urlExpirationTime: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1000&q=80",
    key: "guest_sample_3",
    caption: "Coffee & photography weekend walk in the city ☕📸 #weekend #cityvibes #coffee",
    tags: ["weekend", "cityvibes", "coffee"],
    urlExpirationTime: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
  },
];

authRouter.post("/signup", handleUserSignup);
authRouter.post("/login", handleUserLogin);
authRouter.post("/logout", handleUserLogout);
authRouter.post("/guest", handleGuestLogin);
authRouter.get("/guest", handleGuestLogin);
authRouter.get("/google", googleLogin);
authRouter.post("/exchange", handleTokenExchange);
authRouter.get("/callback/google", handleGoogleCallback);
authRouter.get("/health", (req, res) => {
  return res.send("auth/health goood");
});
