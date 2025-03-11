import type { SlateSheet } from '~/types/slate_sheet_types'

export type SlateDocument = {
    metaData: SlateMetadata,
    pages: SlatePage[]
}

export type SlatePage = {
    uuid: string,
    content: string,
    embeddedImages: any[],
    persistentData: any,
    textType: 'html' | 'markdown' | 'json'
    children: SlatePage[],
    name: string,
    icon: string,
    sheet: SlateSheet | null,
}

export type SlateMetadata = {
    savesOnCloud: boolean,
    endpoint: string,
    fileUuid: string,
    version: 3,
    config: SlateDocumentConfig, // Add this line to include document config
}

export type SlateConfig = {
    colorTheme: 'red' | 'orange' | 'amber' | 'yellow' | 'lime' | 'green' | 'emerald' | 'teal' | 'cyan' | 'sky' | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia' | 'pink' | 'rose' | 'zinc',
    embeddingModels: ModelProvider[],
    chatModels: ModelProvider[],
    selectedEmbeddingModel: string | null,
    selectedChatModel: string | null,
    maxCacheSize: number, // in MB
    cacheTTL: number, // in days
    functionCallingEnabled: boolean,
    confirmDestructiveActions: boolean,
    autosaveInterval: number, // in milliseconds
    defaultEditorTheme: 'light' | 'dark' | 'system',
    spellcheck: boolean,
}

export type SlateDocumentConfig = {
    enabled: boolean
    embeddingCacheId: string,
    lastEmbeddingUpdate: Date | null,
    customInstructions: string,
}

export type ModelProvider = {
    id: string
    endpoint: string,
    chatSpecificEndpoint?: string,
    embeddingSpecificEndpoint?: string,
    model: string,
    modelProvider: 'none' | 'openai' | 'ollama' | 'openrouter' | 'custom',
    apiKey: string,
    name: string,
}