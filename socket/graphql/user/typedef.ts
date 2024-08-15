
export const typeDefs = `#graphql
type User {
  id: String!
  name: String!
  createdAt: String
  email: String!
  isConnected: Boolean
  country: String
  intrests: [String]
  age: Int
  gender: String
  profile: String
  friends: String
  likedPhotos: [String]
  authType: AuthType
}
  type AuthType {
  provider: String
  expires: String
}
  input UpdateUserInput {
  name: String
  email: String
  isConnected: Boolean
  country: String
  intrests: [String]
  age: Int
  gender: String
  friends: String
  likedPhotos: [String]
  authType: AuthTypeInput
}
  input AuthTypeInput {
  provider: String
  expires: String
}
`;
