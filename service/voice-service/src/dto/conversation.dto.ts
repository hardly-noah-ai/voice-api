import type { FromSchema } from 'json-schema-to-ts';

export const conversationItemParamsSchema = {
    type: 'object',
    properties: {
        id: { type: 'string' }
    },
    required: ['id']
} as const;

export const conversationParamsSchema = {
    type: 'object',
    properties: {
        id: { type: 'string' }
    },
    required: ['id']
} as const;

export const conversationItemBodySchema = {
    type: 'object',
    properties: {
        text: { type: 'string' },
        speaker: { type: 'string', enum: ['user', 'bot'] },
        lastItemId: { type: 'string' }
    },
    required: ['text', 'speaker']
} as const;

export const conversationItemQuerySchema = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        speaker: { type: 'string', enum: ['user', 'bot'] },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' }
    }
} as const;

export type ConversationItemParams = FromSchema<typeof conversationItemParamsSchema>;
export type ConversationParams = FromSchema<typeof conversationParamsSchema>;
export type ConversationItemBody = FromSchema<typeof conversationItemBodySchema>;
export type ConversationItemQuery = FromSchema<typeof conversationItemQuerySchema>;
