import AuthNav from "@/components/profile/auth_nav";
import GuestImageGallary from "@/components/profile/guestImageGallary";
import GuestProfileView from "@/components/profile/guestProfileView";

import React from "react";
import WrapperComponent from "./wrapperComponent";

const Page = ({ params }: { params: { id: string } }) => {
  return (
    <WrapperComponent>
      <GuestProfileView id={params.id} />
      <GuestImageGallary guestId={params.id} />
    </WrapperComponent>
  );
};
export default Page;
