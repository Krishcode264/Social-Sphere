import { API } from "../axios";

export const CommonFetcher = async (path: string, query?: any) => {
  console.log("common fetcher", path, query);
  const data = await API.get(`/${path}`, {
    params: query,
  });
  return data.data;
};