export type ConversationSessionResponse = {
    value: string;
    expires_at: number;
    session: {
        type: 'realtime';
        object: 'realtime.session';
        id: string;
        model: 'gpt-realtime';
        output_modalities: ['audio'];
        instructions: string;
        tools: unknown[];
        tool_choice: 'auto';
        max_output_tokens: string;
        tracing: unknown | null;
        truncation: 'auto';
        prompt: unknown | null;
        expires_at: number;
        audio: {
            input: {
                format: {
                    type: 'audio/pcm';
                    rate: number;
                };
                transcription: unknown | null;
                noise_reduction: unknown | null;
                turn_detection: {
                    type: 'server_vad';
                    threshold: number;
                    prefix_padding_ms: number;
                    silence_duration_ms: number;
                    idle_timeout_ms: number | null;
                    create_response: boolean;
                    interrupt_response: boolean;
                };
            };
            output: {
                format: {
                    type: 'audio/pcm';
                    rate: number;
                };
                voice: string;
                speed: number;
            };
        };
        include: unknown | null;
    };
};

export type CompletionRequest = {
    model: string;
    prompt: string | string[];
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    stop?: string | string[];
    user?: string;
};

export type CompletionChoice = {
    text: string;
    index: number;
    logprobs?: Record<string, number> | null;
    finish_reason: 'stop' | 'length' | 'content_filter' | string;
};

export type CompletionResponse = {
    id: string;
    object: 'text_completion';
    created: number;
    model: string;
    choices: CompletionChoice[];
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
};
