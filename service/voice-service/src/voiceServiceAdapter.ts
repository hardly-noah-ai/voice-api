import { injectable } from "tsyringe"
import { LlmClient } from "./client/llmClient"
import { ConversationSessionResponse } from "./client/types"

@injectable()
export class VoiceServiceAdapter {
    constructor(private llmClient: LlmClient) {
    }

    async startConversation(): Promise<ConversationSessionResponse> {
        return await this.llmClient.startConversationSession()
    }
}