import { injectable } from "tsyringe";

@injectable()
export class QuestionHandler {
    constructor(
        private llmClient: LlmClient,
        private dbClient: DbClient
    ) {
    }


    async createNextQuestion(userId: string): Promise<Question> {
        return await this.llmClient.createNextQuestion(userId);
    }
}