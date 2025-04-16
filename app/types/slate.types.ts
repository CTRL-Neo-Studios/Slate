import type { SlateSheet } from '~/types/slate_sheet.types'

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
    sheet?: SlateSheet,
}

export type SlateMetadata = {
    savesOnCloud: boolean,
    endpoint: string,
    fileUuid: string,
    version: 3,
    config: SlateDocumentConfig, // Add this line to include document config
}

export type SlateConfig = {
    themePreset: string;
    themes: SlateThemePreset[]
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

export type SlateThemePreset = {
    id: string;

    // Slate UI
    roundedCornerRadius: number, // in rem, default 0.25rem
    interfaceFont: string, // default Inter
    lightThemeColors: SlateThemeColors,
    darkThemeColors: SlateThemeColors,
    customCss: string, // default is blank

    // Document UI
    lightProseColors: SlateProseColors,
    darkProseColors: SlateProseColors,
    documentFont: string, // default Inter
    documentCss: string, // default is blank
}

export type SlateThemeColors = {
    // All strings are Hex Values. When being applied to CSS, these Hex values should be converted into oklab color formats.
    uiTextDimmed: string,
    uiTextMuted: string,
    uiTextToned: string,
    uiText: string,
    uiTextHighlighted: string,

    uiBg: string,
    uiBgMuted: string,
    uiBgElevated: string,
    uiBgAccented: string,
    uiBgInverted: string,

    uiBorder: string,
    uiBorderMuted: string,
    uiBorderAccented: string,
    uiBorderInverted: string,

    uiPrimary: string,
    uiSecondary: string,
    uiSuccess: string,
    uiInfo: string,
    uiWarning: string,
    uiError: string,
}

export type SlateProseColors = {
    // All strings are Hex Values. When being applied to CSS, these Hex values should be converted into oklab color formats.
    body: string,
    headings: string,
    links: string,
    bold: string,
    bullets: string,
    quotes: string,
    quoteBorders: string,
    captions: string,
    code: string,
}