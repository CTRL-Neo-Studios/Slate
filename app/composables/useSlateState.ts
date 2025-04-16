export function useSlateState() {

    const saved = useState<boolean>('sst.fileSaved', () => false)
    const isSaving = useState<boolean>('sst.savingFile', () => false)
    const isEditingFile = useState<boolean>('sst.isEditingFile', () => false)

    function savedState() {
        return saved
    }

    function isSavingState() {
        return isSaving
    }

    function isEditingFileState() {
        return isEditingFile
    }

    return {
        savedState,
        isSavingState,
        isEditingFileState
    }
}