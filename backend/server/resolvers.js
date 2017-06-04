import { find, filter } from 'lodash';
import { withFilter } from 'graphql-subscriptions';


import { pubsub } from './subscriptions';

const messageAdded = {
	subscribe: withFilter(
		() => pubsub.asyncIterator('messageAdded'),
		(payload, args) => {
			return payload.messageAdded.conversationId === args.conversationId;
		}
	),
};


const resolvers = {
	Query: {
		allCustomers: () => CUSTOMERS,
		customer: (_, args) => find(CUSTOMERS, { id: args.id }),
		allConversations: (_, args) => filter(CONVERSATIONS, { customerId: args.customerId }),
		conversation: (_, args) => find(CONVERSATIONS, { id: args.id }),
		allMessages: (_, args) => filter(MESSAGES, { conversationId: args.conversationId }),
	},
	Customer: {
		conversations: (customer) => filter(CONVERSATIONS, { customerId: customer.id }),
	},
	Conversation: {
		customer: (conversation) => find(CUSTOMERS, { id: conversation.customerId }),
		messages: (conversation) => filter(MESSAGES, { conversationId: conversation.id })
	},
	Mutation: {
		createConversation: (_, args) => {
			const conversation = {
				id: CONVERSATIONS.length + 1,
				customerId: args.customerId
			};

			CONVERSATIONS.push(conversation);

			return conversation;
		},
		createMessage: (_, args) => {
			const message = {
				id: MESSAGES.length + 1,
				text: args.text,
				conversationId: args.conversationId
			};
			MESSAGES.push(message);

			pubsub.publish('messageAdded', { messageAdded: { id: 1, text: 'Hello!' } })
			pubsub.publish('messageAdded', { messageAdded: message || [MESSAGES] })

			return message
		}
	},
	Subscription: {
		messageAdded
	}
};

const CUSTOMERS = [
	{ id: 1, name: 'Chew' },
	{ id: 2, name: 'Ivan' },
	{ id: 3, name: 'Roy' },
];

const CONVERSATIONS = [
	{ id: 1, customerId: 1 },
	{ id: 2, customerId: 1 },
];

const MESSAGES = [
	{ id: 1, conversationId: 1, text: 'Hello from GoBike' },
	{ id: 2, conversationId: 2, text: 'Introduction to React + GraphQL' }
];

export default resolvers;
