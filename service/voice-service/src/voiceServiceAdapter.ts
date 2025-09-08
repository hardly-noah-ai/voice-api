import { injectable } from "tsyringe"
import { LlmClient } from "./client/llmClient"
import { ConversationSessionResponse } from "./client/types"
import { ConversationItemBody, ConversationItemQuery } from "./dto/conversation.dto"
import { ConversationItem } from "./types/conversation.types"
import { ConversationHandler } from "./handlers/conversationHandler"
@injectable()
export class VoiceServiceAdapter {
    constructor(
        private llmClient: LlmClient,
        private conversationHandler: ConversationHandler,
    ) {
    }

    async startConversation(): Promise<ConversationSessionResponse> {
        return await this.llmClient.startConversationSession()
    }

    async saveConversationItem(userId: string, item: ConversationItemBody): Promise<ConversationItem> {
        return await this.conversationHandler.saveConversationItem(userId, item);
    }

    async getConversationItems(userId: string): Promise<ConversationItem[]> {
        return await this.conversationHandler.getConversationItems(userId);
    }

    async getConversationItem(query: ConversationItemQuery): Promise<ConversationItem | undefined> {
        return await this.conversationHandler.getConversationItem(query);
    }
}