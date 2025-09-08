import { BaseDocument } from '../client/dbClient';

export type Speaker = 'user' | 'bot';

export type ConversationItem = BaseDocument & {
    uid: string;
    userId: string;
    text: string;
    speaker: Speaker;
    lastItemId?: string;
};

export type Conversation = BaseDocument & {
    userId: string;
    title?: string;
    startedAt: Date;
    lastActivityAt: Date;
};
