import { injectable } from "tsyringe";
import { LlmHandler } from "./llmHandler";
import { CriteriaStatus, CriteriaPriority } from "../types/question.types";

@injectable()
export class CriteriaHandler {
    constructor(
        private llmHandler: LlmHandler
    ) { }

    async evaluateCriteriaStatuses(conversationHistory: string): Promise<CriteriaStatus[]> {
        const [criteriaPrompt, criteriaList] = await Promise.all([
            this.llmHandler.loadPrompt("evaluateCriteriaPrompt.txt"),
            this.llmHandler.loadPrompt("criteria.txt")
        ]);

        const prompt = this.llmHandler.formatPrompt(criteriaPrompt, {
            criteria: criteriaList,
            conversation: conversationHistory
        });

        const response = await this.llmHandler.callLlm(prompt, 0.3);
        const result = JSON.parse(response);
        return result.criteria_statuses as CriteriaStatus[];
    }

    async determineNextCriteria(
        conversationHistory: string,
        criteriaStatuses: CriteriaStatus[],
        previousQuestions: string
    ): Promise<CriteriaPriority> {
        const prompt = await this.llmHandler.loadPrompt("findCriteriaPrompt.txt");

        const statusSummary = criteriaStatuses
            .map(cs => `${cs.criteria}: ${cs.status}`)
            .join('\n');

        const questionHistory = previousQuestions
            ? `\n\nPREVIOUSLY ASKED QUESTIONS:\n${previousQuestions}\n\nSelect a criterion that hasn't been directly asked about yet.`
            : '';

        const formattedPrompt = this.llmHandler.formatPrompt(prompt, {
            conversation: conversationHistory,
            criteriaStatus: statusSummary + questionHistory
        });

        const response = await this.llmHandler.callLlm(formattedPrompt, 0.5);
        return JSON.parse(response) as CriteriaPriority;
    }

    private async checkCriterionStatus(
        conversationHistory: string,
        criterionName: string
    ): Promise<boolean> {
        const criteriaStatuses = await this.evaluateCriteriaStatuses(conversationHistory);
        const targetCriterion = criteriaStatuses.find(
            cs => cs.criteria.toLowerCase() === criterionName.toLowerCase()
        );

        if (!targetCriterion) {
            return false;
        }

        return targetCriterion.status === "mostly_explored" || targetCriterion.status === "fully_explored";
    }
}