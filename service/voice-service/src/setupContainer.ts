import { container } from "tsyringe";
import { config } from 'dotenv';

export function setupContainer() {
    config({ path: '.env.development.local' });

    container.register('SYSTEM_PROMPT', { useValue: 'You are a helpful AI assistant.' })
    container.register("OPENAI_BASE_URL", { useValue: process.env.OPENAI_BASE_URL })
    container.register("OPENAI_API_KEY", { useValue: process.env.OPENAI_API_KEY })
}