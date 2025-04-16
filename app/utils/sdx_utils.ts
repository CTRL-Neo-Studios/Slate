import type { SdxFileConfig, SdxFileMetadata, SdxPage } from '~/types/sdx.types'

export function sdxDefaults() {
    function defaultMetadata(data?: Partial<SdxFileMetadata>): SdxFileMetadata {
        return {
            fileUuid: data?.fileUuid || useUUID(),
            version: data?.version || 4,
            createdAt: data?.createdAt || new Date().toISOString(),
            modifiedAt: data?.modifiedAt || new Date().toISOString(),
            readOnly: data?.readOnly != undefined ? data.readOnly : false
        } satisfies SdxFileMetadata
    }

    function defaultPage(data?: Partial<SdxPage>): SdxPage {
        return {
            uuid: data?.uuid || useUUID(),
            content: data?.content || '<p></p>',
            icon: data?.icon || 'lucide:file',
            name: data?.name || 'Untitled Page',
            parentPageId: data?.name || '',
            children: [],
            persistentData: data?.persistentData || {},
            reference_to: []
        } satisfies SdxPage
    }

    function defaultConfig(data?: Partial<SdxFileConfig>): SdxFileConfig {
        return {
            curatorEnabled: data?.curatorEnabled != undefined ? data.curatorEnabled : false,
            embeddingCacheId: data?.embeddingCacheId || useUUID(),
            customInstructions: data?.customInstructions || "You are Slate Curator.",
            endpoint: data?.endpoint || '',
            lastEmbeddingUpdate: data?.lastEmbeddingUpdate || null
        } satisfies SdxFileConfig
    }

    return {
        defaultMetadata,
        defaultPage,
        defaultConfig,
    }
}