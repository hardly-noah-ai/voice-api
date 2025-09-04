import { BaseClient } from '@noah-ai/base-client';
import { ConversationSessionResponse } from './types';
import { inject, injectable } from 'tsyringe';

@injectable()
export class LlmClient {
  private client: BaseClient;

  constructor(
    @inject('SYSTEM_PROMPT') private systemPrompt: string,
    @inject('OPENAI_API_KEY') private openaiApiKey: string,
  ) {
    this.client = new BaseClient(process.env.OPENAI_BASE_URL!);
  }

  async startConversationSession(): Promise<ConversationSessionResponse> {
    return await this.client.post<ConversationSessionResponse>('/realtime/client_secrets', {
      session: {
        "type": "realtime",
        "model": "gpt-realtime"
      }
    }, {
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json',
      }
    });
  }
}
