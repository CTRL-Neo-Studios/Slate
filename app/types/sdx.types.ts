export type SdxFileMetadata = { // .sdx/metadata.json
    fileUuid: string,
    version: 4,
    readOnly: boolean,
    createdAt?: string;
    modifiedAt?: string;
}

export type SdxFileConfig = { // .sdx/config.json
    curatorEnabled: boolean
    embeddingCacheId: string,
    lastEmbeddingUpdate?: Date,
    customInstructions: string,
    endpoint?: string,
    homepage?: string,
}

export type SdxPage = { // .sdx/content.db (SQLite)
    uuid: string,
    content: string, // stored by default as Markdown
    persistentData: any,
    children: string[],
    name: string,
    icon: string,
    parentPageId: string,
    reference_to: string[] // Everytime when user switches to another page, the app will write the changes stored to the specific json file that stores the sdxpage. (Or when on save.)
}

export type SdxPageTreeElement = { // ignore this for now
    uuid: string,
    name: string,
    icon: string,
    children: SdxPageTreeElement[]
}