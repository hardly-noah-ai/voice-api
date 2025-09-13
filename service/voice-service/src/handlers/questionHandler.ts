import { injectable } from "tsyringe";
import { DbClient } from "../client/dbClient";
import { ConversationHandler } from "./conversationHandler";
import { CriteriaHandler } from "./criteriaHandler";
import { LlmHandler } from "./llmHandler";
import { ObjectId } from "mongodb";
import { InjectedQuestion, QuestionCache, CriteriaPriority } from "../types/question.types";

@injectable()
export class QuestionHandler {
    constructor(
        private dbClient: DbClient,
        private conversationHandler: ConversationHandler,
        private criteriaHandler: CriteriaHandler,
        private llmHandler: LlmHandler
    ) { }

    async getNextQuestion(userId: string): Promise<InjectedQuestion | undefined> {
        const cachedQuestions = await this.getCachedQuestions(userId);

        if (cachedQuestions.length === 0) {
            void this.generateAndCacheQuestion(userId);
            return undefined;
        }

        const topQuestion = cachedQuestions[0];

        if (!topQuestion.consumed) {
            await this.markAsConsumed(topQuestion._id.toString());
            void this.generateAndCacheQuestion(userId);
            return topQuestion.question;
        }

        void this.generateAndCacheQuestion(userId);
        return undefined;
    }

    private async getCachedQuestions(userId: string): Promise<QuestionCache[]> {
        return await this.dbClient.findMany<QuestionCache>(
            'questionCache',
            { userId },
            { sort: { createdAt: -1 } }
        );
    }

    private async getPreviousQuestions(userId: string): Promise<string> {
        const previousQuestions = await this.dbClient.findMany<QuestionCache>(
            'questionCache',
            { userId },
            { sort: { createdAt: -1 } }
        );

        if (previousQuestions.length === 0) {
            return "";
        }

        return previousQuestions
            .map(q => `- ${q.question.target_criteria}: "${q.question.suggested_question}"`)
            .join('\n');
    }

    private async markAsConsumed(questionId: string): Promise<void> {
        await this.dbClient.updateById<QuestionCache>(
            'questionCache',
            questionId,
            { consumed: true }
        );
    }

    private async generateAndCacheQuestion(userId: string): Promise<void> {
        try {
            const question = await this.generateQuestion(userId);

            const cacheEntry: Omit<QuestionCache, '_id' | 'createdAt' | 'updatedAt'> = {
                uid: new ObjectId().toString(),
                userId,
                question,
                consumed: false
            };

            await this.dbClient.create<QuestionCache>('questionCache', cacheEntry);
        } catch (error) {
            console.error('Error generating question for user', userId, error);
        }
    }

    private async generateQuestion(userId: string): Promise<InjectedQuestion> {
        const conversationHistory = await this.conversationHandler.getConversationHistory(userId);
        const previousQuestions = await this.getPreviousQuestions(userId);

        const criteriaStatuses = await this.criteriaHandler.evaluateCriteriaStatuses(conversationHistory);
        const nextCriteria = await this.criteriaHandler.determineNextCriteria(
            conversationHistory,
            criteriaStatuses,
            previousQuestions
        );

        return await this.createInjectedQuestion(conversationHistory, nextCriteria);
    }

    private async createInjectedQuestion(
        conversationHistory: string,
        nextCriteria: CriteriaPriority
    ): Promise<InjectedQuestion> {
        const prompt = await this.llmHandler.loadPrompt("nextQuestionPrompt.txt");

        const formattedPrompt = this.llmHandler.formatPrompt(prompt, {
            targetCriteria: nextCriteria.selected_criteria,
            rationale: nextCriteria.rationale,
            conversationBridge: nextCriteria.conversation_bridge,
            explorationDepth: nextCriteria.exploration_depth,
            conversation: conversationHistory
        });

        const response = await this.llmHandler.callLlm(formattedPrompt, 0.7);
        return JSON.parse(response) as InjectedQuestion;
    }
}