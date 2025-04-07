// composables/useSlateKnowledge.ts
import { BaseDirectory, exists, readTextFile, writeFile, mkdir } from '@tauri-apps/plugin-fs';
import type { SlateDocument, SlatePage } from '~/types/slate.types';

export const useSlateKnowledge = () => {
    const $slate = useSlateFile();
    const $config = useSlateConfig();
    const $common = useSlateCommon();
    const $toast = useToast();

    const embeddingInProgress = useState<boolean>('embeddingInProgress', () => false);
    const embeddingProgress = useState<number>('embeddingProgress', () => 0);

    // Base directory for storing embeddings
    const EMBEDDINGS_BASE_DIR = 'slate_embeddings';

    /**
     * Creates the embeddings directory if it doesn't exist
     */
    const ensureEmbeddingsDir = async (): Promise<boolean> => {
        try {
            // Ensure base embeddings directory exists
            const dirExists = await exists(EMBEDDINGS_BASE_DIR, { baseDir: BaseDirectory.AppConfig });
            if (!dirExists) {
                await mkdir(EMBEDDINGS_BASE_DIR, { baseDir: BaseDirectory.AppConfig, recursive: true });
            }
            return true;
        } catch (error) {
            console.error('Failed to ensure embeddings directory exists:', error);
            return false;
        }
    };

    /**
     * Gets the embeddings storage path for a document
     */
    const getEmbeddingsPath = (documentId: string): string => {
        return `${EMBEDDINGS_BASE_DIR}/${documentId}_embeddings.json`;
    };

    /**
     * Basic structure for storing page embeddings
     */
    interface PageEmbedding {
        pageId: string;
        pageName: string;
        chunks: {
            text: string;
            embedding: number[];
        }[];
        lastUpdated: string;
    }

    interface DocumentEmbeddings {
        documentId: string;
        pages: PageEmbedding[];
        metadata: {
            modelId: string;
            lastFullUpdate: string;
        };
    }

    /**
     * Loads embeddings for a document
     */
    const loadEmbeddings = async (documentId: string): Promise<DocumentEmbeddings | null> => {
        try {
            await ensureEmbeddingsDir();

            const embeddingsPath = getEmbeddingsPath(documentId);
            const ex = await exists(embeddingsPath, { baseDir: BaseDirectory.AppConfig });

            if (!ex) {
                return null;
            }

            const embeddingsJson = await readTextFile(embeddingsPath, { baseDir: BaseDirectory.AppConfig });
            return JSON.parse(embeddingsJson) as DocumentEmbeddings;
        } catch (error) {
            console.error('Failed to load embeddings:', error);
            return null;
        }
    };

    /**
     * Saves embeddings for a document
     */
    const saveEmbeddings = async (documentId: string, embeddings: DocumentEmbeddings): Promise<boolean> => {
        try {
            await ensureEmbeddingsDir();

            const embeddingsPath = getEmbeddingsPath(documentId);
            const embeddingsJson = JSON.stringify(embeddings, null, 2);
            const encoder = new TextEncoder();
            const data = encoder.encode(embeddingsJson);

            await writeFile(embeddingsPath, data, { baseDir: BaseDirectory.AppConfig });
            return true;
        } catch (error) {
            console.error('Failed to save embeddings:', error);
            return false;
        }
    };

    /**
     * Checks if embeddings exist and are up to date for a document
     */
    const areEmbeddingsUpToDate = async (documentId: string): Promise<boolean> => {
        const docConfig = $config.getDocumentConfig();

        // If knowledge base is disabled for this document, consider it up to date
        if (!docConfig.enabled) {
            return true;
        }

        const embeddings = await loadEmbeddings(documentId);
        if (!embeddings) {
            return false;
        }

        // Check if the selected model has changed
        const globalConfig = $config.getGlobalConfig();
        const currentModelId = globalConfig.selectedEmbeddingModel;

        if (!currentModelId || embeddings.metadata.modelId !== currentModelId) {
            return false;
        }

        // Check if any pages have been modified since the last embedding update
        const lastUpdateTime = new Date(embeddings.metadata.lastFullUpdate);
        const docLastEmbeddingUpdate = docConfig.lastEmbeddingUpdate;

        if (!docLastEmbeddingUpdate || new Date(docLastEmbeddingUpdate) > lastUpdateTime) {
            return false;
        }

        return true;
    };

    /**
     * Splits text into chunks for embedding
     */
    const splitTextIntoChunks = (text: string, chunkSize: number = 1000, overlap: number = 200): string[] => {
        if (!text || text.length <= chunkSize) {
            return [text];
        }

        const chunks: string[] = [];
        let startPos = 0;

        while (startPos < text.length) {
            let endPos = startPos + chunkSize;

            // If we're not at the end, try to break at a sentence or paragraph
            if (endPos < text.length) {
                // Look for paragraph breaks first
                const paragraphBreak = text.lastIndexOf('\n\n', endPos);
                if (paragraphBreak > startPos && paragraphBreak > endPos - 200) {
                    endPos = paragraphBreak;
                } else {
                    // Look for sentence breaks
                    const sentenceBreak = Math.max(
                        text.lastIndexOf('. ', endPos),
                        text.lastIndexOf('! ', endPos),
                        text.lastIndexOf('? ', endPos)
                    );

                    if (sentenceBreak > startPos && sentenceBreak > endPos - 100) {
                        endPos = sentenceBreak + 1; // Include the period and space
                    }
                }
            }

            chunks.push(text.substring(startPos, endPos).trim());
            startPos = endPos - overlap;
        }

        return chunks;
    };

    /**
     * Generates embeddings for text using the configured model
     */
    const generateEmbeddings = async (texts: string[]): Promise<number[][] | null> => {
        try {
            const globalConfig = $config.getGlobalConfig();
            const modelId = globalConfig.selectedEmbeddingModel;

            if (!modelId) {
                throw new Error('No embedding model selected in configuration');
            }

            const modelConfig = globalConfig.embeddingModels.find(m => m.id === modelId);
            if (!modelConfig) {
                throw new Error(`Selected embedding model ${modelId} not found in configuration`);
            }

            // Determine the endpoint to use
            let endpoint = modelConfig.embeddingSpecificEndpoint || modelConfig.endpoint;
            const apiKey = modelConfig.apiKey;

            if (!endpoint) {
                throw new Error('No endpoint specified for the selected embedding model');
            }

            // Adjust request based on model provider
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
                            input: texts,
                            encoding_format: 'float'
                        })
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
                    }

                    const openaiData = await response.json();
                    return openaiData.data.map((item: any) => item.embedding);

                case 'ollama':
                    // Process texts sequentially for Ollama
                    const embeddings: number[][] = [];

                    for (const text of texts) {
                        response = await fetch(endpoint, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                model: modelConfig.model,
                                prompt: text
                            })
                        });

                        if (!response.ok) {
                            const error = await response.json();
                            throw new Error(`Ollama API error: ${JSON.stringify(error)}`);
                        }

                        const ollamaData = await response.json();
                        embeddings.push(ollamaData.embedding);
                    }

                    return embeddings;

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
                            texts: texts
                        })
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(`Custom API error: ${JSON.stringify(error)}`);
                    }

                    const customData = await response.json();
                    return customData.embeddings;

                default:
                    throw new Error(`Unsupported model provider: ${modelConfig.modelProvider}`);
            }
        } catch (error) {
            console.error('Failed to generate embeddings:', error);
            return null;
        }
    };

    /**
     * Processes a single page to generate embeddings
     */
    const processPageForEmbeddings = async (
        page: SlatePage,
        existingEmbeddings?: PageEmbedding
    ): Promise<PageEmbedding | null> => {
        try {
            // Convert page content to plain text based on textType
            let plainText = '';

            switch (page.textType) {
                case 'html':
                    // Use your convertToPlainTextWithSlate helper
                    plainText = $common.convertToPlainTextWithSlate([page.content])[0] || '';
                    break;
                case 'markdown':
                    // For markdown, we can use the content directly or parse it if needed
                    plainText = page.content;
                    break;
                case 'json':
                    // For JSON, try to extract meaningful text or skip
                    try {
                        const jsonContent = JSON.parse(page.content);
                        // This is just a simple example - adjust based on your JSON structure
                        plainText = JSON.stringify(jsonContent, null, 2);
                    } catch {
                        plainText = page.content;
                    }
                    break;
            }

            // Include page name in the content to be embedded
            plainText = `${page.name || 'Untitled Page'}\n\n${plainText}`;

            // Split into chunks
            const textChunks = splitTextIntoChunks(plainText);

            // Generate embeddings for all chunks
            const embeddings = await generateEmbeddings(textChunks);

            if (!embeddings) {
                throw new Error('Failed to generate embeddings for page');
            }

            // Create page embedding object
            return {
                pageId: page.uuid,
                pageName: page.name || 'Untitled Page',
                chunks: textChunks.map((text, i) => ({
                    text,
                    embedding: embeddings[i] || []
                })),
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error(`Failed to process page ${page.uuid} for embeddings:`, error);
            return null;
        }
    };

    /**
     * Recursively process pages and their children to generate embeddings
     */
    const processPageHierarchy = async (
        pages: SlatePage[],
        documentEmbeddings: DocumentEmbeddings,
        processedCount: Ref<number>,
        totalPages: number
    ): Promise<void> => {
        for (const page of pages) {
            // Check if we already have embeddings for this page - we'll update them anyway
            const existingPageEmbedding = documentEmbeddings.pages.find(p => p.pageId === page.uuid);

            // Process current page
            const pageEmbedding = await processPageForEmbeddings(page, existingPageEmbedding);

            if (pageEmbedding) {
                // Remove existing entry if present
                if (existingPageEmbedding) {
                    const index = documentEmbeddings.pages.findIndex(p => p.pageId === page.uuid);
                    if (index !== -1) {
                        documentEmbeddings.pages.splice(index, 1);
                    }
                }

                // Add new embedding
                documentEmbeddings.pages.push(pageEmbedding);
            }

            // Update progress
            processedCount.value++;
            embeddingProgress.value = Math.floor((processedCount.value / totalPages) * 100);

            // Process children recursively
            if (page.children && page.children.length > 0) {
                await processPageHierarchy(page.children, documentEmbeddings, processedCount, totalPages);
            }
        }
    };

    /**
     * Recursively counts all pages in a document
     */
    const countAllPages = (pages: SlatePage[]): number => {
        let count = pages.length;
        for (const page of pages) {
            if (page.children && page.children.length > 0) {
                count += countAllPages(page.children);
            }
        }
        return count;
    };

    /**
     * Builds or updates embeddings for the current document
     */
    const buildDocumentEmbeddings = async (force: boolean = false): Promise<boolean> => {
        try {
            const currentDoc = unref($slate.getCurrentSlateDoc());
            if (!currentDoc) {
                throw new Error('No document loaded');
            }

            const docConfig = $config.getDocumentConfig();

            // If knowledge base is disabled for this document, don't proceed
            if (!docConfig.enabled) {
                $toast.add({
                    title: 'Knowledge Base Disabled',
                    description: 'Enable knowledge base in document settings first',
                    color: 'warning'
                });
                return false;
            }

            // Check if embeddings are already up to date
            if (!force) {
                const upToDate = await areEmbeddingsUpToDate(currentDoc.metaData.fileUuid);

                if (upToDate) {
                    $toast.add({
                        title: 'Embeddings Up to Date',
                        description: 'Document embeddings are already current',
                        color: 'success'
                    });
                    return true;
                }
            }

            // Set embedding in progress
            embeddingInProgress.value = true;
            embeddingProgress.value = 0;

            $toast.add({
                title: 'Building Knowledge Base',
                description: 'Generating embeddings for document pages...',
                color: 'info'
            });

            // Get global config for model info
            const globalConfig = $config.getGlobalConfig();
            const modelId = globalConfig.selectedEmbeddingModel;

            if (!modelId) {
                throw new Error('No embedding model selected in configuration');
            }

            // Load existing embeddings or create new structure
            let documentEmbeddings = await loadEmbeddings(currentDoc.metaData.fileUuid) || {
                documentId: currentDoc.metaData.fileUuid,
                pages: [],
                metadata: {
                    modelId,
                    lastFullUpdate: new Date().toISOString()
                }
            };

            // Update metadata
            documentEmbeddings.metadata.modelId = modelId;
            documentEmbeddings.metadata.lastFullUpdate = new Date().toISOString();

            // Count total pages for progress tracking
            const totalPages = countAllPages(currentDoc.pages);
            const processedCount = ref(0);

            // Process all pages
            await processPageHierarchy(
                currentDoc.pages,
                documentEmbeddings,
                processedCount,
                totalPages
            );

            // Save embeddings
            const saved = await saveEmbeddings(currentDoc.metaData.fileUuid, documentEmbeddings);

            if (saved) {
                // Update document config with last embedding update time
                await $config.updateDocumentConfig({
                    lastEmbeddingUpdate: new Date()
                });

                $toast.add({
                    title: 'Knowledge Base Updated',
                    description: `Successfully embedded ${totalPages} pages`,
                    color: 'success'
                });
            }

            return saved;
        } catch (error) {
            console.error('Failed to build document embeddings:', error);

            $toast.add({
                title: 'Knowledge Base Error',
                description: error instanceof Error ? error.message : 'Unknown error occurred',
                color: 'error'
            });

            return false;
        } finally {
            embeddingInProgress.value = false;
            embeddingProgress.value = 0;
        }
    };

    /**
     * Deletes embeddings for the current document
     */
    const deleteDocumentEmbeddings = async (): Promise<boolean> => {
        try {
            const currentDoc = unref($slate.getCurrentSlateDoc());
            if (!currentDoc) {
                throw new Error('No document loaded');
            }

            // Get the embeddings path
            const embeddingsPath = getEmbeddingsPath(currentDoc.metaData.fileUuid);

            // Check if embeddings exist
            const embeddingsExist = await exists(embeddingsPath, { baseDir: BaseDirectory.AppConfig });

            if (!embeddingsExist) {
                return true; // Nothing to delete
            }

            // Delete the embeddings file
            await writeFile(embeddingsPath, new Uint8Array(), { baseDir: BaseDirectory.AppConfig });

            // Update document config
            await $config.updateDocumentConfig({
                lastEmbeddingUpdate: null
            });

            $toast.add({
                title: 'Knowledge Base Deleted',
                description: 'Document embeddings have been removed',
                color: 'success'
            });

            return true;
        } catch (error) {
            console.error('Failed to delete document embeddings:', error);

            $toast.add({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Unknown error occurred',
                color: 'error'
            });

            return false;
        }
    };

    /**
     * Computes the cosine similarity between two vectors
     */
    const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
        if (vecA.length !== vecB.length) {
            throw new Error('Vectors must have the same dimensions');
        }

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += (vecA[i] || 0) * (vecB[i] || 0);
            normA += Math.pow((vecA[i] || 0), 2);
            normB += Math.pow((vecB[i] || 0), 2);
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    };

    /**
     * Queries the document embeddings with a question and returns relevant passages
     */
    interface SearchResult {
        pageId: string;
        pageName: string;
        text: string;
        similarity: number;
    }

    const queryDocumentKnowledge = async (
        query: string,
        limit: number = 5,
        similarityThreshold: number = 0.6
    ): Promise<SearchResult[]> => {
        try {
            const currentDoc = unref($slate.getCurrentSlateDoc());
            if (!currentDoc) {
                throw new Error('No document loaded');
            }

            // Check if embeddings exist and are up to date
            const upToDate = await areEmbeddingsUpToDate(currentDoc.metaData.fileUuid);

            if (!upToDate) {
                throw new Error('Document embeddings are missing or outdated');
            }

            // Load embeddings
            const documentEmbeddings = await loadEmbeddings(currentDoc.metaData.fileUuid);
            if (!documentEmbeddings) {
                throw new Error('Could not load document embeddings');
            }

            // Generate embedding for the query
            const queryEmbeddings = await generateEmbeddings([query]);
            if (!queryEmbeddings || queryEmbeddings.length === 0) {
                throw new Error('Failed to generate embedding for query');
            }

            const queryEmbedding = queryEmbeddings[0] || [];

            // Calculate similarity with all chunks
            const results: SearchResult[] = [];

            for (const page of documentEmbeddings.pages) {
                for (const chunk of page.chunks) {
                    try {
                        const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);

                        if (similarity >= similarityThreshold) {
                            results.push({
                                pageId: page.pageId,
                                pageName: page.pageName,
                                text: chunk.text,
                                similarity
                            });
                        }
                    } catch (e) {
                        console.warn('Error calculating similarity for chunk:', e);
                        // Continue with other chunks
                    }
                }
            }

            // Sort by similarity (highest first) and limit results
            return results
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, limit);

        } catch (error) {
            console.error('Error querying document knowledge:', error);
            throw error;
        }
    };

    /**
     * Formats knowledge base results for inclusion in prompts
     */
    const formatKnowledgeForPrompt = (results: SearchResult[]): string => {
        if (results.length === 0) {
            return '';
        }

        let formatted = '# Relevant Document Knowledge\n\n';

        results.forEach((result, index) => {
            formatted += `## ${result.pageName}\n\n${result.text}\n\n`;
        });

        return formatted;
    };

    /**
     * Checks if knowledge base is enabled and available for current document
     */
    const isKnowledgeBaseAvailable = async (): Promise<boolean> => {
        const currentDoc = unref($slate.getCurrentSlateDoc());
        if (!currentDoc) {
            return false;
        }

        const docConfig = $config.getDocumentConfig();
        if (!docConfig.enabled) {
            return false;
        }

        const globalConfig = $config.getGlobalConfig();
        if (!globalConfig.selectedEmbeddingModel) {
            return false;
        }

        return await areEmbeddingsUpToDate(currentDoc.metaData.fileUuid);
    };

    return {
        buildDocumentEmbeddings,
        deleteDocumentEmbeddings,
        queryDocumentKnowledge,
        formatKnowledgeForPrompt,
        isKnowledgeBaseAvailable,
        isEmbeddingInProgress: computed(() => embeddingInProgress.value),
        embeddingProgress: computed(() => embeddingProgress.value),
        areEmbeddingsUpToDate
    };
};
