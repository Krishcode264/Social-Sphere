"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const QueryProvider = ({ children }:{children:React.ReactNode}) => {
const client = new QueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
