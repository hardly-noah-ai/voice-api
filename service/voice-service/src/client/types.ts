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
