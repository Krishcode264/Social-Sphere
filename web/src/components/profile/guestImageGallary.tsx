import type { PhotoType } from "@/types/types";
import { getUserPhotos } from "@/utils/fechers";
import React, { Suspense } from "react";
import PostView from "./postView";
import Loading from "../basic/loading";

const GuestImageGallary = async ({ guestId }: { guestId: string }) => {
  const photos  = await getUserPhotos(guestId);
  return (
    <Suspense fallback={<Loading/>}>
      { photos.map((photo: PhotoType) => {
        return <PostView photo={photo} key={photo.id} />;
      })}
    </Suspense>
  );
};

export default GuestImageGallary;
