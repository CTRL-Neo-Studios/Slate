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
}

export type SlateMetadata = {
    savesOnCloud: boolean,
    endpoint: string,
    fileUuid: string,
}