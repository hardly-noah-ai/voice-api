import { injectable } from "tsyringe"
import { LlmClient } from "./client/llmClient"
import { ConversationSessionResponse } from "./client/types"
import { ConversationItemBody, ConversationItemQuery } from "./dto/conversation.dto"
import { ConversationItem } from "./types/conversation.types"
import { ConversationHandler } from "./handlers/conversationHandler"
import { QuestionHandler } from "./handlers/questionHandler"
import { InjectedQuestion } from "./types/question.types"
import { CriteriaHandler } from "./handlers/criteriaHandler"

@injectable()
export class VoiceServiceAdapter {
    constructor(
        private llmClient: LlmClient,
        private conversationHandler: ConversationHandler,
        private questionHandler: QuestionHandler,
        private criteriaHandler: CriteriaHandler
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

    async getNextQuestion(userId: string): Promise<InjectedQuestion | undefined> {
        return await this.questionHandler.getNextQuestion(userId);
    }

    async isCriterionMet(userId: string, criterionName: string): Promise<boolean> {
        return await this.criteriaHandler.checkCriterionStatus(userId, criterionName);
    }
}