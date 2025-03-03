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
}

export type SlateMetadata = {
    savesOnCloud: boolean,
    endpoint: string,
    fileUuid: string,
    version: 2,
}