import { User } from "../../types/types";

export const queries = `#graphql
sayHello:String,
getUser(id:String):User
`;