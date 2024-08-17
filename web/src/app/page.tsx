import Loading from "@/components/basic/loading";
import ProfileView from "@/components/feed/ProfileView";
import type { FeedUserType, User } from "@/types/types";
import { getFeedUsers } from "./actions";
import Link from "next/link";
import React, { Suspense } from "react";
export const revalidate = 10;
import { cookies } from "next/headers";
import Error from "@/components/basic/Error";
export default async function Page() {
  const users = await getFeedUsers();

  return (
    <div className="flex gap-4 flex-wrap p-4">
      <Suspense fallback={<Loading />}>
        {users.length > 0 ? (
          users.map((user: FeedUserType) => {
            return (
              <Link href={`/profile/${user._id}`} key={user._id}>
                <ProfileView user={user} />
              </Link>
            );        
          })
        ) : (
        <Error tip="something went wrong from our side"/>
        )}
      </Suspense>
    </div>
  );
}
