import { injectable } from "tsyringe";
import { LlmClient } from "../client/llmClient";
import { DbClient } from "../client/dbClient";
import { ConversationHandler } from "./conversationHandler";
import { ObjectId } from "mongodb";
import * as fs from "fs/promises";
import { InjectedQuestion, QuestionCache, CriteriaStatus, CriteriaPriority } from "../types/question.types";

@injectable()
export class QuestionHandler {
    constructor(
        private llmClient: LlmClient,
        private dbClient: DbClient,
        private conversationHandler: ConversationHandler
    ) { }

    async getNextQuestion(userId: string): Promise<InjectedQuestion | null> {
        const cachedQuestions = await this.getCachedQuestions(userId);

        if (cachedQuestions.length === 0) {
            this.generateAndCacheQuestion(userId).catch(error =>
                console.error('Failed to generate question:', error)
            );
            return null;
        }

        const topQuestion = cachedQuestions[0];

        if (!topQuestion.consumed) {
            await this.markAsConsumed(topQuestion._id.toString());
            this.generateAndCacheQuestion(userId).catch(error =>
                console.error('Failed to generate question:', error)
            );
            return topQuestion.question;
        }

        this.generateAndCacheQuestion(userId).catch(error =>
            console.error('Failed to generate question:', error)
        );
        return null;
    }

    private async getCachedQuestions(userId: string): Promise<QuestionCache[]> {
        return await this.dbClient.findMany<QuestionCache>(
            'questionCache',
            { userId },
            { sort: { createdAt: -1 } }
        );
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
        const conversationHistory = await this.buildConversationHistory(userId);
        const criteriaStatuses = await this.evaluateCriteriaStatuses(conversationHistory);
        const nextCriteria = await this.determineNextCriteria(conversationHistory, criteriaStatuses);
        return await this.createInjectedQuestion(conversationHistory, nextCriteria);
    }

    private async buildConversationHistory(userId: string): Promise<string> {
        const conversationItems = await this.conversationHandler.getConversationItems(userId);

        if (conversationItems.length === 0) {
            return "";
        }

        return conversationItems
            .map(item => `${item.speaker}: ${item.text}`)
            .join('\n');
    }

    private async evaluateCriteriaStatuses(conversationHistory: string): Promise<CriteriaStatus[]> {
        const [criteriaPrompt, criteriaList] = await Promise.all([
            this.loadPrompt("evaluateCriteriaPrompt.txt"),
            this.loadPrompt("criteria.txt")
        ]);

        const prompt = this.formatPrompt(criteriaPrompt, {
            criteria: criteriaList,
            conversation: conversationHistory
        });

        const response = await this.callLlm(prompt, 0.3);
        const result = JSON.parse(response);
        return result.criteria_statuses as CriteriaStatus[];
    }

    private async determineNextCriteria(
        conversationHistory: string,
        criteriaStatuses: CriteriaStatus[]
    ): Promise<CriteriaPriority> {
        const prompt = await this.loadPrompt("findCriteriaPrompt.txt");

        const statusSummary = criteriaStatuses
            .map(cs => `${cs.criteria}: ${cs.status}`)
            .join('\n');

        const formattedPrompt = this.formatPrompt(prompt, {
            conversation: conversationHistory,
            criteriaStatus: statusSummary
        });

        const response = await this.callLlm(formattedPrompt, 0.5);
        return JSON.parse(response) as CriteriaPriority;
    }

    private async createInjectedQuestion(
        conversationHistory: string,
        nextCriteria: CriteriaPriority
    ): Promise<InjectedQuestion> {
        const prompt = await this.loadPrompt("nextQuestionPrompt.txt");

        const formattedPrompt = this.formatPrompt(prompt, {
            targetCriteria: nextCriteria.selected_criteria,
            rationale: nextCriteria.rationale,
            conversationBridge: nextCriteria.conversation_bridge,
            explorationDepth: nextCriteria.exploration_depth,
            conversation: conversationHistory
        });

        const response = await this.callLlm(formattedPrompt, 0.7);
        return JSON.parse(response) as InjectedQuestion;
    }

    private async callLlm(prompt: string, temperature: number): Promise<string> {
        const payload = {
            model: "gpt-4-turbo-preview",
            messages: [
                {
                    role: "system",
                    content: "You are an expert matchmaker. Return only valid JSON."
                },
            ],
            temperature,
            response_format: { type: "json_object" },
            prompt
        };

        const response = await this.llmClient.createTextCompletion(payload);
        return response.choices[0].text;
    }

    private formatPrompt(template: string, variables: Record<string, string>): string {
        return Object.entries(variables).reduce(
            (prompt, [key, value]) => prompt.replace(new RegExp(`{{${key}}}`, 'g'), value),
            template
        );
    }

    private async loadPrompt(filename: string): Promise<string> {
        try {
            return await fs.readFile(`./prompts/${filename}`, 'utf-8');
        } catch (error) {
            throw new Error(`Failed to load prompt file: ${filename}`);
        }
    }
}