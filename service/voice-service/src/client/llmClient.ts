import { BaseClient } from '@noah-ai/base-client';
import {
  CompletionRequest,
  CompletionResponse,
  ConversationSessionResponse
} from './types';
import { inject, injectable } from 'tsyringe';

@injectable()
export class LlmClient {
  private client: BaseClient;

  constructor(
    @inject('OPENAI_API_KEY') private openaiApiKey: string
  ) {
    this.client = new BaseClient(process.env.OPENAI_BASE_URL!);
  }

  async startConversationSession(): Promise<ConversationSessionResponse> {
    return this.client.post<ConversationSessionResponse>(
      '/realtime/client_secrets',
      { session: { type: 'realtime', model: 'gpt-realtime', instructions: await this.getSystemPrompt() } },
      { headers: { Authorization: `Bearer ${this.openaiApiKey}`, 'Content-Type': 'application/json' } }
    );
  }

  async createTextCompletion(
    payload: CompletionRequest
  ): Promise<CompletionResponse> {
    return this.client.post<CompletionResponse>(
      '/v1/completions',
      payload,
      { headers: { Authorization: `Bearer ${this.openaiApiKey}`, 'Content-Type': 'application/json' } }
    );
  }

  private async getSystemPrompt(): Promise<string> {
    const fs = await import('fs/promises');
    const path = await import('path');
    return await fs.readFile(
      path.join(__dirname, '..', 'prompts', 'voiceSystemPrompt.txt'),
      'utf8'
    );
  }
}
