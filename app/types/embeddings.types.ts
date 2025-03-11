export type EmbeddingChunk = {
    id: string;
    pageId: string;
    content: string;
    embedding: number[];
    metadata: {
        pageName: string;
        pageIcon: string;
        lastUpdated: string;
        modelId: string;
    };
}

export type EmbeddingCacheMetadata = {
    documentId: string;
    lastUpdated: string;
    modelId: string;
    chunkCount: number;
    size: number; // in bytes
}