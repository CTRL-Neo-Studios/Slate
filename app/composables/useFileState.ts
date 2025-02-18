export const useFileState = () => {
    const filePath = useState<string | null>("filePath", () => null); // Tracks the current file path
    const isSaved = useState<boolean>("isSaved", () => false); // Tracks whether the file is saved
    const savingFile = useState<boolean>("savingFile", () => false);

    const setFilePath = (path: string) => {
        filePath.value = path;
        isSaved.value = true; // Mark as saved when a file path is set
    };

    const resetFileState = () => {
        filePath.value = null;
        isSaved.value = false; // Reset state for a new file
    };

    const setSavedStatus = (value: boolean) => {
        if (value)
            savingFile.value = !value;
        isSaved.value = value;
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
        let fp = (unref(getFilePath()) || "Untitled Note").split('/')
        return fp[fp.length - 1]
    }

    return { getFilePath, isFileSaved, isSavingFile, setSavedStatus, setSavingFile, setFilePath, resetFileState, getFileName };
};