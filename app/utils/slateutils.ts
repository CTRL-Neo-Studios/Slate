import type { SlateDocument, SlatePage } from '~/slate.types'

export const defaultSlateDocument = (pageUUID: string): SlateDocument => {
    return {
        metaData: {
            endpoint: '',
            fileUuid: '',
            savesOnCloud: false
        },
        pages: [
            defaultSlatePage(pageUUID)
        ]
    }
}

export const defaultSlateDocumentUUID = (): SlateDocument => {
    return defaultSlateDocument(useUUID())
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
