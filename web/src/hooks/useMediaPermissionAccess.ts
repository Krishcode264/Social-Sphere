"use client ";
import { userPermissionState } from "@/store/atoms/user-permissions_atom";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
export const useMediaPermissionAccess = () => {
  interface MediaState {
    video: string;
    audio: string;
  }
  const [{ video, audio }, setMediaPermission] =
    useRecoilState(userPermissionState);

    console.log(video,audio,"from hook")
  useEffect(() => {
    if (audio != "granted" || video != "granted") {
      (async () => {
        const { state: video } = await navigator.permissions.query({
          name: "camera" as PermissionName,
        });
        const { state: audio } = await navigator.permissions.query({
          name: "microphone" as PermissionName,
        });

        setMediaPermission((prev) => ({ ...prev, audio, video }));
      })();
    }
  }, []);
};
