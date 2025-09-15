import { BaseClient } from "@noah-ai/base-client";
import {
    ConversationSessionResponse
} from "../../../../service/voice-service/src/client/types";
import { ConversationItem } from "../../../../service/voice-service/src/types/conversation.types";
import { InjectedQuestion } from "../../../../service/voice-service/src/types/question.types";

export class LlmClient extends BaseClient {
    constructor(url: string) {
        super(url);
    }

    public async startConversationSession(): Promise<ConversationSessionResponse> {
        return await this.get('/start-conversation');
    }

    public async saveConversationItem(
        id: string,
        item: { text: string; speaker: 'user' | 'bot'; lastItemId?: string }
    ): Promise<ConversationItem> {
        return await this.post(`/conversation-item/${id}`, item);
    }

    public async getConversationItems(id: string): Promise<ConversationItem[]> {
        return await this.get(`/conversation-items/${id}`);
    }

    public async getConversationItem(query: {
        id?: string;
        userId?: string;
        speaker?: 'user' | 'bot';
        startDate?: string;
        endDate?: string;
    }): Promise<ConversationItem | undefined> {
        return await this.get('/conversation-item', query);
    }

    public async getNextQuestion(userId: string): Promise<InjectedQuestion | undefined> {
        return await this.get('/next-question', { userId });
    }

    public async isCriterionMet(
        userId: string,
        criterionName: string
    ): Promise<boolean> {
        return await this.get('/is-criterion-met', { userId, criterionName });
    }
}