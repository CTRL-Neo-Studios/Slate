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

export type SlateConfig = {
    colorTheme: 'red' | 'orange' | 'amber' | 'yellow' | 'lime' | 'green' | 'emerald' | 'teal' | 'cyan' | 'sky' | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia' | 'pink' | 'rose' | 'none'

}