// composables/useSlateAI.ts
export const useSlateCurator = () => {
    const $knowledge = useSlateKnowledge();
    const $config = useSlateConfig();
    const $toast = useToast();

    const isProcessing = useState<boolean>('aiProcessing', () => false);

    /**
     * Generates a response using an AI model with knowledge from the current document
     */
    const generateResponse = async (
        prompt: string,
        useKnowledgeBase: boolean = true,
        temperature: number = 0.7
    ): Promise<string | null> => {
        try {
            isProcessing.value = true;

            const globalConfig = $config.getGlobalConfig();
            const modelId = globalConfig.selectedChatModel;

            if (!modelId) {
                throw new Error('No chat model selected in configuration');
            }

            const modelConfig = globalConfig.chatModels.find(m => m.id === modelId);
            if (!modelConfig) {
                throw new Error(`Selected chat model ${modelId} not found in configuration`);
            }

            // Determine the endpoint to use
            let endpoint = modelConfig.chatSpecificEndpoint || modelConfig.endpoint;
            const apiKey = modelConfig.apiKey;

            if (!endpoint) {
                throw new Error('No endpoint specified for the selected chat model');
            }

            // Get knowledge from the document if enabled
            let knowledgeContext = '';
            if (useKnowledgeBase) {
                const isAvailable = await $knowledge.isKnowledgeBaseAvailable();

                if (isAvailable) {
                    const results = await $knowledge.queryDocumentKnowledge(prompt, 3);
                    if (results.length > 0) {
                        knowledgeContext = $knowledge.formatKnowledgeForPrompt(results);
                    }
                }
            }

            // Get document custom instructions if available
            const docConfig = $config.getDocumentConfig();
            const customInstructions = docConfig.customInstructions || '';

            // Prepare messages for the API
            const messages = [];

            // Add system message with custom instructions and knowledge
            let systemContent = 'You are a helpful assistant.';

            if (customInstructions) {
                systemContent += ' ' + customInstructions;
            }

            messages.push({ role: 'system', content: systemContent });

            // Add knowledge as a system message if available
            if (knowledgeContext) {
                messages.push({
                    role: 'system',
                    content: `The following information may be relevant to the user's query:\n\n${knowledgeContext}`
                });
            }

            // Add user message
            messages.push({ role: 'user', content: prompt });

            // Make request based on model provider
            let response;

            switch (modelConfig.modelProvider) {
                case 'openai':
                    response = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${apiKey}`
                        },
                        body: JSON.stringify({
                            model: modelConfig.model,
                            messages: messages,
                            temperature: temperature,
                            stream: false
                        })
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
                    }

                    const openaiData = await response.json();
                    return openaiData.choices[0].message.content;

                case 'ollama':
                    response = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            model: modelConfig.model,
                            messages: messages,
                            temperature: temperature
                        })
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(`Ollama API error: ${JSON.stringify(error)}`);
                    }

                    const ollamaData = await response.json();
                    return ollamaData.message.content;

                case 'custom':
                    // Custom implementation based on your endpoint
                    response = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
                        },
                        body: JSON.stringify({
                            model: modelConfig.model,
                            messages: messages,
                            temperature: temperature
                        })
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(`Custom API error: ${JSON.stringify(error)}`);
                    }

                    const customData = await response.json();
                    return customData.response;

                default:
                    throw new Error(`Unsupported model provider: ${modelConfig.modelProvider}`);
            }
        } catch (error) {
            console.error('Failed to generate AI response:', error);
            $toast.add({
                title: 'AI Error',
                description: error instanceof Error ? error.message : 'Unknown error occurred',
                color: 'error'
            });
            return null;
        } finally {
            isProcessing.value = false;
        }
    };

    return {
        generateResponse,
        isProcessing: computed(() => isProcessing.value)
    };
};
