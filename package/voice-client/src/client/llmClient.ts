import { BaseClient } from "@noah-ai/base-client";
import { ConversationSessionResponse } from "../../../../service/voice-service/src/client/types";

export class LlmClient extends BaseClient {
    constructor(url: string) {
        super(url);
    }

    public async startConversationSession(): Promise<ConversationSessionResponse> {
        return await this.get('/start-conversation');
    }
}