"use client";

import React from "react";
import useResetAllState from "@/hooks/useResetAllState";
import Cookies from "js-cookie";
const Page = () => {
  const resetAllState = useResetAllState();
  const handleSignOut = () => {
    resetAllState();
    Cookies.remove("token");
    window.sessionStorage.removeItem("token");
  };

  return (
    <div>
      settings page
      <form action={handleSignOut}>
        <button type="submit">sign out</button>
      </form>
    </div>
  );
};

export default Page;
