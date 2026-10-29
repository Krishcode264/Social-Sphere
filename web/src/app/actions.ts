"use server";
import { API } from "@/utils/axios";
import { cache } from "react";

export const getFeedUsers = cache(async () => {
  try {
    const res = await API.get("/feed/getFeedUsers", { timeout: 8000 });
    return res.data;
  } catch (err) {
    console.log("error in get feedusers", err);
    return [];
  }
});
