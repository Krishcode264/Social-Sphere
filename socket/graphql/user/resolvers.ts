import { UserData } from "../../mongoose/schemas/userSchema";
import UserService from "../../Services/UserService/userService";
import type { UserSchemaType } from "../../types/types";
const mutations = {
  sayHello: () => "Hello from GraphQL server",

  updateUser: (_: any, args: { id: string; data: Partial<UserSchemaType> }) => {
    const { id, data } = args;
    return true;
  },
};

const queries = {
  sayHello: () => "i am from alopo server ",
  getUser: async (_: any, { id }: { id: string }) => {
    return await UserData.findOne({ email: id });
  },
};
export const resolvers = { mutations, queries };
