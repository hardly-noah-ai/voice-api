import { injectable } from "tsyringe"
import { LlmClient } from "../client/llmClient"
import { DbClient } from "../client/dbClient"
import { ConversationSessionResponse } from "../client/types"
import { ConversationItemBody, ConversationItemQuery } from "../dto/conversation.dto"
import { ConversationItem } from "../types/conversation.types"
import { ObjectId } from "mongodb"


@injectable()
export class ConversationHandler {
    constructor(
        private llmClient: LlmClient,
        private dbClient: DbClient
    ) {
    }

    async startConversation(): Promise<ConversationSessionResponse> {
        return await this.llmClient.startConversationSession()
    }

    async saveConversationItem(userId: string, item: ConversationItemBody): Promise<ConversationItem> {

        const conversationItem: Omit<ConversationItem, '_id' | 'createdAt' | 'updatedAt'> = {
            uid: new ObjectId().toString(),
            userId,
            text: item.text,
            speaker: item.speaker,
            lastItemId: item.lastItemId
        }

        return await this.dbClient.create<ConversationItem>('conversationItems', conversationItem);
    }

    async getConversationItems(userId: string): Promise<ConversationItem[]> {
        return await this.dbClient.findMany<ConversationItem>('conversationItems', { userId }, { sort: { createdAt: -1 } });
    }

    async getConversationItem(query: ConversationItemQuery): Promise<ConversationItem | undefined> {
        const filter: any = {};

        if (query.id) {
            return await this.dbClient.findById<ConversationItem>('conversationItems', query.id);
        }

        if (query.userId) filter.userId = query.userId;
        if (query.speaker) filter.speaker = query.speaker;

        if (query.startDate || query.endDate) {
            filter.createdAt = {};
            if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
            if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
        }

        return await this.dbClient.findOne<ConversationItem>('conversationItems', filter);
    }

    async getConversationHistory(userId: string): Promise<string> {
        const conversationItems = await this.getConversationItems(userId);

        if (conversationItems.length === 0) {
            return "";
        }

        return conversationItems
            .map(item => `${item.speaker}: ${item.text}`)
            .join('\n');
    }

}