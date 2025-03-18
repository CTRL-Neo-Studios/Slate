import type { SlateConfig, SlateDocument, SlateDocumentConfig, SlateMetadata, SlatePage } from '~/types/slate.types'
import { undefined } from 'zod'
import type { SlateSheet } from '~/types/slate_sheet.types'

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
        backgroundTheme: 'zinc',
        defaultEditorTheme: 'system',
        confirmDestructiveActions: false,
        maxCacheSize: 100,
        functionCallingEnabled: true,
        selectedChatModel: null,
        selectedEmbeddingModel: null,
        spellcheck: false,
    } satisfies SlateConfig
}

export const defaultSlateSheet = (): SlateSheet => {
    return {
        connections: [],
        instances: [],
    } satisfies SlateSheet
}



export function themeVariableColors() {
    return [
        {
            label: 'Primary',
            value: 'primary',
            chip: {
                color: 'primary' as const
            }
        },
        {
            label: 'Secondary',
            value: 'secondary',
            chip: {
                color: 'secondary' as const
            }
        },
        {
            label: 'Success',
            value: 'success',
            chip: {
                color: 'success' as const
            }
        },
        {
            label: 'Info',
            value: 'info',
            chip: {
                color: 'info' as const
            }
        },
        {
            label: 'Warning',
            value: 'warning',
            chip: {
                color: 'warning' as const
            }
        },
        {
            label: 'Error',
            value: 'error',
            chip: {
                color: 'error' as const
            }
        },
        {
            label: 'Neutral',
            value: 'neutral',
            chip: {
                color: 'neutral' as const
            }
        }
    ]
}

export function themeColors() {
    return [
        {
            label: 'Neutral',
            value: 'neutral',
            chip: {
                color: 'neutral' as const
            }
        },
        {
            label: 'Slate',
            value: 'slate',
            chip: {
                color: 'slate' as const
            }
        },
        {
            label: 'Gray',
            value: 'gray',
            chip: {
                color: 'gray' as const
            }
        },
        {
            label: 'Zinc',
            value: 'zinc',
            chip: {
                color: 'zinc' as const
            }
        },
        {
            label: 'Stone',
            value: 'stone',
            chip: {
                color: 'stone' as const
            }
        },
        {
            label: 'Red',
            value: 'red',
            chip: {
                color: 'red' as const
            }
        },
        {
            label: 'Orange',
            value: 'orange',
            chip: {
                color: 'orange' as const
            }
        },
        {
            label: 'Amber',
            value: 'amber',
            chip: {
                color: 'amber' as const
            }
        },
        {
            label: 'Yellow',
            value: 'yellow',
            chip: {
                color: 'yellow' as const
            }
        },
        {
            label: 'Lime',
            value: 'lime',
            chip: {
                color: 'lime' as const
            }
        },
        {
            label: 'Green',
            value: 'green',
            chip: {
                color: 'green' as const
            }
        },
        {
            label: 'Emerald',
            value: 'emerald',
            chip: {
                color: 'emerald' as const
            }
        },
        {
            label: 'Teal',
            value: 'teal',
            chip: {
                color: 'teal' as const
            }
        },
        {
            label: 'Cyan',
            value: 'cyan',
            chip: {
                color: 'cyan' as const
            }
        },
        {
            label: 'Sky',
            value: 'sky',
            chip: {
                color: 'sky' as const
            }
        },
        {
            label: 'Blue',
            value: 'blue',
            chip: {
                color: 'blue' as const
            }
        },
        {
            label: 'Indigo',
            value: 'indigo',
            chip: {
                color: 'indigo' as const
            }
        },
        {
            label: 'Violet',
            value: 'violet',
            chip: {
                color: 'violet' as const
            }
        },
        {
            label: 'Purple',
            value: 'purple',
            chip: {
                color: 'purple' as const
            }
        },
        {
            label: 'Fuchsia',
            value: 'fuchsia',
            chip: {
                color: 'fuchsia' as const
            }
        },
        {
            label: 'Pink',
            value: 'pink',
            chip: {
                color: 'pink' as const
            }
        },
        {
            label: 'Rose',
            value: 'rose',
            chip: {
                color: 'rose' as const
            }
        }
    ]
}

export function themeVariableVariants() {
    return [
        {
            label: 'Solid',
            value: 'solid'
        },
        {
            label: 'Outline',
            value: 'outline'
        },
        {
            label: 'Soft',
            value: 'soft'
        },
        {
            label: 'Subtle',
            value: 'subtle'
        }
    ]
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
