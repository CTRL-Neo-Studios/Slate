// composables/useSlateDocumentSettings.ts
export const useSlateKnowledgeDocumentSettings = () => {
    const $config = useSlateConfig();
    const $knowledge = useSlateKnowledge();
    const $slate = useSlateFile();
    const $toast = useToast();

    /**
     * Enables or disables the knowledge base for the current document
     */
    const toggleKnowledgeBase = async (enabled: boolean): Promise<boolean> => {
        try {
            // Get current document config
            const docConfig = $config.getDocumentConfig();

            // If enabling and no embedding model is selected, show error
            if (enabled) {
                const globalConfig = $config.getGlobalConfig();
                if (!globalConfig.selectedEmbeddingModel) {
                    $toast.add({
                        title: 'Configuration Required',
                        description: 'Please select an embedding model in settings first',
                        color: 'warning'
                    });
                    return false;
                }
            }

            // Update document config
            await $config.updateDocumentConfig({
                enabled
            });

            // If enabling, check if embeddings need to be generated
            if (enabled) {
                const currentDoc = unref($slate.getCurrentSlateDoc());
                if (currentDoc) {
                    const upToDate = await $knowledge.areEmbeddingsUpToDate(currentDoc.metaData.fileUuid);

                    if (!upToDate) {
                        $toast.add({
                            title: 'Knowledge Base Needs Update',
                            description: 'Embeddings need to be generated for this document',
                            color: 'info'
                        });
                    }
                }
            }

            return true;
        } catch (error) {
            console.error('Failed to toggle knowledge base:', error);
            return false;
        }
    };

    /**
     * Updates the custom instructions for the document
     */
    const updateCustomInstructions = async (instructions: string): Promise<boolean> => {
        try {
            return await $config.updateDocumentConfig({
                customInstructions: instructions
            });
        } catch (error) {
            console.error('Failed to update custom instructions:', error);
            return false;
        }
    };

    return {
        toggleKnowledgeBase,
        updateCustomInstructions,
    };
};
