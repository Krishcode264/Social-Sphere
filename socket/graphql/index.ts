import { ApolloServer } from "@apollo/server";
import { Query } from "mongoose";
import { User } from "./user";
import { typeDefs } from "./user/typedef";

export default async function createGraphqlServer() {

  const gqlServer = new ApolloServer({
    typeDefs: `
    ${typeDefs}
         type Query {
     ${User.queries}
       }
     type Mutation{
     ${User.mutations}
     }
        `,
    resolvers: {
      Query: {
        ...User.resolvers.queries
      },
      Mutation:{
        ...User.resolvers.mutations
      }
  
    },
  });
  await gqlServer.start();
  return gqlServer
}
