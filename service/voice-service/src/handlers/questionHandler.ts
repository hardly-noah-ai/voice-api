import { injectable } from "tsyringe";
import { DbClient } from "../client/dbClient";
import { LlmClient } from "../client/llmClient";
import { ConversationHandler } from "./conversationHandler";
import { Question, QuestionChecklist, ChecklistCriteria } from "../types/question.types";

@injectable()
export class QuestionHandler {
    constructor(
        private llmClient: LlmClient,
        private dbClient: DbClient,
        private conversationHandler: ConversationHandler
    ) {
    }

    async updateQuestionsChecklist(userId: string): Promise<ChecklistCriteria[]> {
        // Get or create checklist for user
        let checklist = await this.dbClient.findOne<QuestionChecklist>('questionChecklists', { userId });

        if (!checklist) {
            // Create initial checklist with default criteria
            const initialCriteria = [
                "Shows genuine interest in the other person",
                "Asks open-ended questions",
                "Shares personal stories and experiences",
                "Demonstrates active listening",
                "Shows confidence without arrogance",
                "Uses appropriate humor",
                "Respects boundaries and consent",
                "Shows vulnerability appropriately",
                "Maintains good conversation flow",
                "Expresses authentic emotions"
            ];

            checklist = await this.dbClient.create<QuestionChecklist>('questionChecklists', {
                userId,
                criteria: initialCriteria,
                lastUpdated: new Date()
            });
        }

        // Get all conversation items for the user
        const allConversationItems = await this.conversationHandler.getConversationItems(userId);

        if (allConversationItems.length === 0) {
            return checklist.criteria.map((criterion, index) => ({
                id: `criterion_${index}`,
                description: criterion,
                category: "general",
                isMet: false
            }));
        }

        // Format conversation for analysis
        const conversationHistory = allConversationItems.map(item =>
            `${item.speaker}: ${item.text}`
        ).join('\n');

        // Create prompt to analyze which criteria are met
        const prompt = `You are an expert dating coach analyzing a conversation. Based on the conversation history below, determine which of the following criteria have been met by the user:

CRITERIA TO EVALUATE:
${checklist.criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

CONVERSATION HISTORY:
${conversationHistory}

For each criterion, determine if it has been demonstrated in the conversation. Respond with a JSON array where each object contains:
- id: "criterion_[number]" (e.g., "criterion_1")
- description: the exact criterion text
- category: "communication", "confidence", "emotional_intelligence", or "general"
- isMet: true if the criterion has been demonstrated, false otherwise

Focus on the user's contributions to the conversation. Be strict but fair in your evaluation.

JSON Response:`;

        const payload = {
            model: "gpt-3.5-turbo-instruct",
            prompt: prompt,
            max_tokens: 1000,
            temperature: 0.3,
            user: userId
        };

        const llmResponse = await this.llmClient.createTextCompletion(payload);
        const responseText = llmResponse.choices[0]?.text || '[]';

        const evaluatedCriteria = JSON.parse(responseText) as ChecklistCriteria[];

        // Update the checklist with new evaluation
        await this.dbClient.updateById<QuestionChecklist>('questionChecklists', checklist._id!.toString(), {
            lastUpdated: new Date()
        });

        return evaluatedCriteria;
    }

    async createNextQuestion(userId: string): Promise<Question> {
        // First, update the checklist to see what criteria are missing
        const checklistCriteria = await this.updateQuestionsChecklist(userId);

        // Find the most absent criteria (not met)
        const unmetCriteria = checklistCriteria.filter(c => !c.isMet);

        let targetCriterion: string;
        let category: string;

        if (unmetCriteria.length === 0) {
            // All criteria met, generate a general improvement question
            targetCriterion = "Continue improving overall dating conversation skills";
            category = "general_improvement";
        } else {
            // Find the most important unmet criterion
            targetCriterion = unmetCriteria[0].description;
            category = unmetCriteria[0].category;
        }

        // Get recent conversation for context
        const conversationItems = await this.conversationHandler.getConversationItems(userId);
        const last5Items = conversationItems.slice(-5);

        const conversationHistory = last5Items.map(item =>
            `${item.speaker}: ${item.text}`
        ).join('\n');

        const prompt = `You are an expert dating coach. Based on the conversation history and the specific area that needs improvement, generate a targeted follow-up question.

TARGET AREA FOR IMPROVEMENT: ${targetCriterion}
CATEGORY: ${category}

CONVERSATION HISTORY:
${conversationHistory}

Generate a question that will help the user practice and improve in the specific area identified. The question should be:
- Directly related to the unmet criterion
- Practical and actionable
- Appropriate for the conversation context
- Encouraging but challenging

Respond with a JSON object containing:
- question: the question text
- context: brief context explaining why this question is important
- category: the category of the question
- difficulty: easy, medium, or hard
- tags: array of relevant tags

JSON Response:`;

        const payload = {
            model: "gpt-3.5-turbo-instruct",
            prompt: prompt,
            max_tokens: 500,
            temperature: 0.7,
            user: userId
        };

        const llmResponse = await this.llmClient.createTextCompletion(payload);
        const responseText = llmResponse.choices[0]?.text || '{}';
        const questionData = JSON.parse(responseText) as Omit<Question, '_id' | 'createdAt' | 'updatedAt'>;

        const questionToStore = {
            ...questionData,
            userId
        };

        const storedQuestion = await this.dbClient.create<Question>('questions', questionToStore);
        return storedQuestion;
    }
}