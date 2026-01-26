"use client";
import type { PhotoType } from "@/types/types";
import { getUserPhotos } from "@/utils/fechers";
import React, { Suspense, useEffect, useState } from "react";
import PostView from "./postView";
import Loading from "../basic/loading";

const GuestImageGallary = ({ guestId }: { guestId: string }) => {
  const [photos, setPhotos] = useState<PhotoType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const token = window.sessionStorage.getItem("token");
        if (token) {
          // Retrieve token string directly? The fetcher expects string.
          // But fetcher argument is optional.
          const data = await getUserPhotos(guestId, token);
          setPhotos(data);
        }
      } catch (err) {
        console.error("Failed to fetch guest photos", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, [guestId]);

  if (loading) return <Loading />;

  return (
    <Suspense fallback={<Loading />}>
      {photos.length > 0 && photos.map((photo: PhotoType) => {
        return <PostView photo={photo} key={photo.id} userId={guestId} />;
      })}
    </Suspense>
  );
};

export default GuestImageGallary;
