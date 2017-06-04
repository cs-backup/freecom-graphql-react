import { makeExecutableSchema } from 'graphql-tools';
import resolvers from './resolvers';

const typeDefs = `
  input Filter {
    customerId: Int
    conversationId: Int
  }

  type Message {
    id: Int!
    text: String!
    conversation: Conversation
  }

  type Customer {
    id: Int!
    name: String!
    conversations: [Conversation]
  }

  type Conversation {
    id: Int!
    customer: Customer
    messages: [Message!]!
  }

  type Query {
    allCustomers: [Customer]
    customer(id: Int!): Customer
    allConversations(customerId: Int!): [Conversation]
    conversation(conversationId: Int!): Conversation
    allMessages(conversationId: Int!): [Message]
  }

  type Mutation {
    createConversation(customerId: Int!): Conversation
    createMessage(text: String!, conversationId: Int!): Message
  }

  type Subscription {
    newMessage: String!
    messageAdded(conversationId: Int!): Message
    messageAdded2(filter: Filter): Message
  }

  schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }
`;

const executableSchema = makeExecutableSchema({
  typeDefs: typeDefs,
  resolvers,
});

export default executableSchema;
