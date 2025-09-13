import { injectable } from "tsyringe";
import { LlmClient } from "../client/llmClient";
import * as fs from "fs/promises";

@injectable()
export class LlmHandler {
    constructor(
        private llmClient: LlmClient
    ) { }

    async callLlm(prompt: string, temperature: number): Promise<string> {
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

    formatPrompt(template: string, variables: Record<string, string>): string {
        return Object.entries(variables).reduce(
            (prompt, [key, value]) => prompt.replace(new RegExp(`{{${key}}}`, 'g'), value),
            template
        );
    }

    async loadPrompt(filename: string): Promise<string> {
        try {
            return await fs.readFile(`./prompts/${filename}`, 'utf-8');
        } catch (error) {
            throw new Error(`Failed to load prompt file: ${filename}`);
        }
    }
}