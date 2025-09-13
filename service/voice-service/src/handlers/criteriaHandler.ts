import { injectable } from "tsyringe";
import { LlmHandler } from "./llmHandler";
import { CriteriaStatus, CriteriaPriority, Criteria, RawCriteriaStatus } from "../types/question.types";
import { ConversationHandler } from "./conversationHandler";

@injectable()
export class CriteriaHandler {
    constructor(
        private llmHandler: LlmHandler,
        private conversationHandler: ConversationHandler
    ) { }

    private parseCriteriaString(criteriaString: string): Criteria {
        const criteriaEntry = Object.entries(Criteria).find(
            ([_, value]) => value === criteriaString
        );

        if (!criteriaEntry) {
            console.error(`Unknown criteria received from LLM: "${criteriaString}"`);
            throw new Error(`Unknown criteria: ${criteriaString}`);
        }

        return criteriaEntry[1] as Criteria;
    }

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



        const criteriaStatuses = result.criteria_statuses.map((criteriaStatus: RawCriteriaStatus) => ({
            ...criteriaStatus,
            criteria: this.parseCriteriaString(criteriaStatus.criteria)
        })) as CriteriaStatus[];

        return criteriaStatuses;
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

    async checkCriterionStatus(
        userId: string,
        criterionName: string
    ): Promise<boolean> {
        const conversationHistory = await this.conversationHandler.getConversationHistory(userId);
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