import type { SlateConfig, SlateDocument, SlateDocumentConfig, SlateMetadata, SlatePage } from '~/slate.types'

export const defaultSlateMetadata = (): SlateMetadata => {
    return {
        endpoint: '',
        fileUuid: useUUID(),
        savesOnCloud: false,
        version: 3,
        config: defaultSlateDocumentConfig()
    } satisfies SlateMetadata
}

export const defaultSlateDocument = (): SlateDocument => {
    return {
        metaData: defaultSlateMetadata(),
        pages: []
    } satisfies SlateDocument
}

export const createDefaultSlateDocument = (initialUUID: string): SlateDocument => {
    const doc: SlateDocument = {
        metaData: defaultSlateMetadata(),
        pages: []
    }
    doc.pages.push(defaultSlatePage(initialUUID))
    return doc
}

export const defaultSlatePage = (pageUUID: string): SlatePage => {
    return {
        content: '<p></p>',
        embeddedImages: [],
        persistentData: null,
        textType: 'html',
        uuid: pageUUID,
        icon: 'lucide:file',
        name: 'Page',
        children: []
    }
}

export const defaultSlateDocumentConfig = (): SlateDocumentConfig => {
    return {
        enabled: false,
        customInstructions: 'You are Slate Curator, an AI that assists the users in using Slate, a rich-text tiptap-based note-taking app.',
        lastEmbeddingUpdate: null,
        embeddingCacheId: useUUID()
    } satisfies SlateDocumentConfig
}

export const defaultSlateConfig = (): SlateConfig => {
    return {
        autosaveInterval: 5,
        cacheTTL: 5,
        chatModels: [],
        embeddingModels: [],
        colorTheme: 'zinc',
        defaultEditorTheme: 'system',
        confirmDestructiveActions: false,
        maxCacheSize: 100,
        functionCallingEnabled: true,
        selectedChatModel: null,
        selectedEmbeddingModel: null,
        spellcheck: false,
    } satisfies SlateConfig
}

/**
 * Changes the extension of a file path to the target extension
 * @param filePath - The original file path (with or without extension)
 * @param targetExtension - The new extension (with or without leading dot)
 * @returns The file path with the new extension
 */
export function changeFileExtension(filePath: string, targetExtension: string): string {
    // Normalize the target extension to include the dot
    const normalizedExtension = targetExtension.startsWith('.')
        ? targetExtension
        : `.${targetExtension}`;

    // Find the last dot in the file path
    const lastDotIndex = filePath.lastIndexOf('.');
    const lastSlashIndex = Math.max(
        filePath.lastIndexOf('/'),
        filePath.lastIndexOf('\\')
    );

    // If there's no dot or the last dot appears before the last slash
    // (meaning it's part of a directory name), append the new extension
    if (lastDotIndex === -1 || lastDotIndex < lastSlashIndex) {
        return filePath + normalizedExtension;
    }

    // Replace the existing extension with the new one
    return filePath.slice(0, lastDotIndex) + normalizedExtension;
}
