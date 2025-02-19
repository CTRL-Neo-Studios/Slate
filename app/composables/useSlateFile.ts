import type { SlateDocument, SlateMetadata, SlatePage } from '~/slate.types'
import { SlateModalWarning } from '#components'

export const useSlateFile = () => {
    const $m = useModal(), $t = useToast()

    const filePath = useState<string | null>('filePath', () => null) // Tracks the current file path
    const isSaved = useState<boolean>('isSaved', () => false) // Tracks whether the file is saved
    const savingFile = useState<boolean>('savingFile', () => false)
    const currentSlateDoc = useState<SlateDocument | null>('slateDocument', () => null)

    const setFilePath = (path: string) => {
        filePath.value = path
        isSaved.value = true // Mark as saved when a file path is set
    }

    const resetFileState = () => {
        filePath.value = null
        isSaved.value = false // Reset state for a new file
    }

    const setSavedStatus = (value: boolean) => {
        if (value)
            savingFile.value = !value
        isSaved.value = value
    }

    const isFileSaved = () => {
        return isSaved
    }

    const getFilePath = () => {
        return filePath
    }

    const isSavingFile = () => {
        return savingFile
    }

    const setSavingFile = (value: boolean) => {
        savingFile.value = value
    }

    const getFileName = () => {
        let fp = (unref(getFilePath()) || 'Untitled Note').split('/')
        return fp[fp.length - 1]
    }

    const getFileMetadata = () => {
        return currentSlateDoc.value?.metaData
    }

    const setSlateDocumentMetadata = (data: Partial<SlateMetadata>) => {
        if(currentSlateDoc.value == null) return;

        currentSlateDoc.value.metaData = {
            fileUuid: data.fileUuid || currentSlateDoc.value?.metaData?.fileUuid || '',
            endpoint: data.endpoint || currentSlateDoc.value?.metaData?.endpoint || '',
            savesOnCloud: data.savesOnCloud || currentSlateDoc.value?.metaData?.savesOnCloud || false,
        }
    }

    const getCurrentSlateDoc = () => {
        return currentSlateDoc
    }

    const getCurrentSlatePage = (pageUUID: MaybeRef<string> | ComputedRef<string>) => {
        return currentSlateDoc.value?.pages.find((i: SlatePage) => i.uuid == unref(pageUUID))
    }

    const setSlatePageData = (pageUUID: string, data: Partial<SlatePage>) => {
        if(currentSlateDoc.value == null) return;

        currentSlateDoc.value.pages.map((i: SlatePage) => {
            if (i.uuid != pageUUID) return i
            return {
                content: data.content || i.content || '<p></p>',
                embeddedImages: data.embeddedImages || i.embeddedImages || [],
                persistentData: data.persistentData || i.persistentData || null,
                textType: data.textType || i.textType || 'html',
                uuid: i.uuid,
            } satisfies SlatePage
        })
    }

    const setSlatePageContent = (pageUUID: MaybeRef<string> | ComputedRef<string>, content: string) => {
        setSlatePageData(unref(pageUUID), { content })
    }

    const setSlateDocument = (doc: SlateDocument) => {
        currentSlateDoc.value = doc
    }

    /*
    * @return Returns the new page.
     */
    const createSlateDocument = () => {
        const newPageUUID = useUUID()
        if (currentSlateDoc.value != null && !isSaved.value) {
            $m.open(SlateModalWarning, {
                title: 'Create New Document',
                description: 'There are unsaved changes in the current document. Are you sure you want to move on to a new one without saving your current changes?',
                optCancelLabel: 'No, Let Me Save First',
                optConfirmLabel: 'Yes, Discard My Changes',
                async onConfirm() {
                    currentSlateDoc.value = defaultSlateDocument(newPageUUID)
                    await navigateTo(`/document/${newPageUUID}`)
                },
            })
        } else {
            currentSlateDoc.value = defaultSlateDocument(newPageUUID)
            navigateTo(`/document/${newPageUUID}`)
        }

        return newPageUUID
    }

    const createSlatePage = async (newPageUUID: string) => {
        if (!isSaved.value) {
            await useNoteSaver().saveNote()
        }

        currentSlateDoc.value?.pages.push(defaultSlatePage(newPageUUID))
        navigateTo(`/document/${newPageUUID}`)
    }

    return {
        getFilePath,
        isFileSaved,
        isSavingFile,
        setSavedStatus,
        setSavingFile,
        setFilePath,
        resetFileState,
        getFileName,
        getFileMetadata,
        getCurrentSlateDoc,
        setSlateDocumentMetadata,
        setSlatePageData,
        setSlatePageContent,
        createSlateDocument,
        getCurrentSlatePage,
        setSlateDocument,
        createSlatePage
    }
}