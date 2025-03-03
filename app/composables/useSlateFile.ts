import type { SlateDocument, SlateMetadata, SlatePage } from '~/slate.types'
import { SlateModalWarning } from '#components'

export const useSlateFile = () => {
    const $m = useOverlay(), $t = useToast()

    const filePath = useState<string | null>('filePath', () => null) // Tracks the current file path
    const isSaved = useState<boolean>('isSaved', () => false) // Tracks whether the file is saved
    const savingFile = useState<boolean>('savingFile', () => false)
    const currentSlateDoc = useState<SlateDocument | null>('slateDocument', () => null)
    const pageMap = useState<Map<string, SlatePage>>('pageMap', () => new Map())
    const expandedTreeNodes = useState<string[]>("expandedTreeNodes", () => [])
    // const expandedNodes = useState<Set<string>>('expandedNodes', () => new Set())
    // const pathCache = new Map<string, PagePathNode[]>()

    const clearFile = () => {
        useNoteSaver().clearCurrentAutoSave()
        resetFileState()
        filePath.value = null
        currentSlateDoc.value = null
        expandedTreeNodes.value = []
        pageMap.value.clear()
    }

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
            version: 2,
            fileUuid: data.fileUuid || currentSlateDoc.value?.metaData?.fileUuid || '',
            endpoint: data.endpoint || currentSlateDoc.value?.metaData?.endpoint || '',
            savesOnCloud: data.savesOnCloud || currentSlateDoc.value?.metaData?.savesOnCloud || false
        }
    }

    const getCurrentSlateDoc = () => {
        return currentSlateDoc
    }

    const getCurrentSlatePage = (pageUUID: MaybeRef<string> | ComputedRef<string>): SlatePage | undefined => {
        return pageMap.value.get(unref(pageUUID))
    }

    const setSlatePageData = (pageUUID: MaybeRef<string> | ComputedRef<string>, data: Partial<SlatePage>) => {
        const page = pageMap.value.get(unref(pageUUID))
        if (!page) return

        const newData: SlatePage = {
            content: data.content || page.content || '<p></p>',
            embeddedImages: data.embeddedImages || page.embeddedImages || [],
            persistentData: data.persistentData || page.persistentData || null,
            textType: data.textType || page.textType || 'html',
            children: data.children || page.children || [],
            name: data.name || page.name || 'Page',
            icon: data.icon || page.icon || 'lucide:file',
            uuid: data.uuid || page.uuid || useUUID()
        } satisfies SlatePage

        Object.assign(page, newData)
    }

    const setSlatePageContent = (pageUUID: MaybeRef<string> | ComputedRef<string>, content: string) => {
        setSlatePageData(pageUUID, {content})
    }

    // Helper to rebuild the page map
    const rebuildPageMap = () => {
        pageMap.value.clear()
        if (!currentSlateDoc.value?.pages) return

        // Recursive function to map all pages including nested ones
        const mapPages = (pages: SlatePage[]) => {
            pages.forEach(page => {
                pageMap.value.set(page.uuid, page)
                if (page.children?.length) {
                    mapPages(page.children)
                }
            })
        }

        mapPages(currentSlateDoc.value.pages)
    }

    const addChildPage = (parentUUID: string, newPage: SlatePage) => {
        const parentPage = pageMap.value.get(parentUUID)
        if (!parentPage) return

        parentPage.children = parentPage.children || []
        parentPage.children.push(newPage)
        pageMap.value.set(newPage.uuid, newPage)
    }

    // Modified createSlatePage to handle nesting
    const createSlatePage = async (newPageUUID: string, parentUUID?: string) => {
        if (!isSaved.value) {
            await useNoteSaver().saveNote()
        }

        const newPage = defaultSlatePage(newPageUUID)

        if (parentUUID) {
            addChildPage(parentUUID, newPage)
        } else {
            currentSlateDoc.value?.pages.push(newPage)
        }

        pageMap.value.set(newPageUUID, newPage)
        useNoteSaver().autoSave()
        await navigateTo(`/document/${newPageUUID}`)
    }

    // New utility method for moving pages in the hierarchy
    const movePage = (pageUUID: string, newParentUUID: string | null, index?: number) => {
        const page = pageMap.value.get(pageUUID)
        if (!page) return

        // Remove from current parent
        const removePage = (pages: SlatePage[]): boolean => {
            const index = pages.findIndex(p => p.uuid === pageUUID)
            if (index !== -1) {
                pages.splice(index, 1)
                return true
            }
            return pages.some(p => p.children?.length && removePage(p.children))
        }

        if (currentSlateDoc.value) {
            removePage(currentSlateDoc.value.pages)
        }

        // Add to new parent
        if (newParentUUID) {
            const newParent = pageMap.value.get(newParentUUID)
            if (newParent) {
                newParent.children = newParent.children || []
                if (typeof index === 'number') {
                    newParent.children.splice(index, 0, page)
                } else {
                    newParent.children.push(page)
                }
            }
        } else {
            // Add to root level
            if (currentSlateDoc.value) {
                if (typeof index === 'number') {
                    currentSlateDoc.value.pages.splice(index, 0, page)
                } else {
                    currentSlateDoc.value.pages.push(page)
                }
            }
        }
    }

    const createSlateDocument = () => {
        const newPageUUID = useUUID()
        if (currentSlateDoc.value != null && !isSaved.value) {
            const modal = $m.create(SlateModalWarning, {
                props: {
                    title: 'Create New Document',
                    description: 'There are unsaved changes in the current document. Are you sure you want to move on to a new one without saving your current changes?',
                    optCancelLabel: 'No, Let Me Save First',
                    optConfirmLabel: 'Yes, Discard My Changes',
                    async onConfirm() {
                        clearFile()
                        currentSlateDoc.value = defaultSlateDocument(newPageUUID)
                        await navigateTo(`/document/${newPageUUID}`)
                        modal.close()
                    },
                },
            })
            modal.open()
        } else {
            currentSlateDoc.value = defaultSlateDocument(newPageUUID)
            navigateTo(`/document/${newPageUUID}`)
        }

        rebuildPageMap()

        return newPageUUID
    }

    /**
     * Deletes a page and handles its children according to the recursive flag
     * @param pageUUID - UUID of the page to delete
     * @param recursive - If true, deletes all child pages. If false, promotes child pages to the parent's level
     * @returns boolean - Whether the deletion was successful
     */
    const deletePage = (pageUUID: string, recursive: boolean = false): boolean => {
        if ((currentSlateDoc.value?.pages.length || 1) <= 1 && currentSlateDoc.value?.pages[0]?.uuid == pageUUID) {
            $t.add({
                title: 'You cannot delete the only page in your document.',
                color: 'error',
                icon: 'lucide:circle-x'
            })
            return false
        }

        if(pageMap.value == null){
            rebuildPageMap()
        }

        const pageToDelete = pageMap.value?.get(pageUUID)
        if (!pageToDelete) return false

        // Helper function to find parent page and index
        const findParentInfo = (searchPages: SlatePage[], target: string): { parent: SlatePage | null, index: number } | null => {
            for (let i = 0; i < searchPages.length; i++) {
                const page = searchPages[i]
                if (page?.children?.some(child => child.uuid === target)) {
                    return { parent: page, index: page.children.findIndex(child => child.uuid === target) }
                }
                if (page?.children?.length) {
                    const result = findParentInfo(page.children, target)
                    if (result) return result
                }
            }
            // Check if it's a root level page
            if (currentSlateDoc.value?.pages.some(p => p.uuid === target)) {
                return {
                    parent: null,
                    index: currentSlateDoc.value.pages.findIndex(p => p.uuid === target)
                }
            }
            return null
        }

        // Helper function to recursively delete pages from the map
        const deletePageAndChildren = (page: SlatePage) => {
            pageMap.value.delete(page.uuid)
            if (page.children?.length) {
                page.children.forEach(child => deletePageAndChildren(child))
            }
        }

        if (!currentSlateDoc.value) return false

        const parentInfo = findParentInfo(currentSlateDoc.value.pages, pageUUID)
        if (!parentInfo) return false

        const { parent, index } = parentInfo
        const pages = parent ? parent.children! : currentSlateDoc.value.pages

        if (recursive) {
            // Delete the page and all its children
            deletePageAndChildren(pageToDelete)
            pages.splice(index, 1)
        } else {
            // Delete only the page and promote its children
            pageMap.value?.delete(pageUUID)
            const childrenToPromote = pageToDelete.children || []
            pages.splice(index, 1, ...childrenToPromote)
        }

        if (getCurrentSlatePage(useRoute().params.pageId as any as string || '') == null)
            navigateTo(`/document/${currentSlateDoc.value.pages[0]?.uuid || ''}`)

        return true
    }

    // Example usage for deleting multiple pages
    const deletePages = (pageUUIDs: string[], recursive: boolean = false) => {
        return pageUUIDs.map(uuid => deletePage(uuid, recursive))
    }

    type RenameOperation = {
        type: 'prefix' | 'suffix' | 'replace' | 'rename'
        value: string
        replaceValue?: string // Only used when type is 'replace'
    }

    /**
     * Batch move pages to a new parent
     * @param pageUUIDs Array of page UUIDs to move
     * @param newParentUUID Destination parent UUID (null for root level)
     * @param startIndex Starting index in the new parent's children array (optional)
     */
    const movePages = (
        pageUUIDs: string[],
        newParentUUID: string | null,
        startIndex?: number
    ) => {
        pageUUIDs.forEach((uuid, idx) => {
            const actualIndex = typeof startIndex === 'number'
                ? startIndex + idx
                : undefined
            movePage(uuid, newParentUUID, actualIndex)
        })
    }

    /**
     * Rename a single page
     * @param pageUUID UUID of the page to rename
     * @param operation Rename operation to perform
     */
    const renamePage = (pageUUID: string, operation: RenameOperation): void => {
        if(pageMap.value == null){
            rebuildPageMap()
        }

        const page = pageMap.value?.get(pageUUID)
        if (!page) return

        let newName = page.name || ''

        switch (operation.type) {
            case 'prefix':
                newName = `${operation.value}${newName}`
                break
            case 'suffix':
                newName = `${newName}${operation.value}`
                break
            case 'replace':
                if (operation.replaceValue !== undefined) {
                    newName = newName.replace(
                        new RegExp(operation.value, 'g'),
                        operation.replaceValue
                    )
                }
                break
            case 'rename':
                newName = operation.replaceValue || 'Page'
                break
        }

        setPageTitle(pageUUID, newName)

        useNoteSaver().saveNote().then(r => {
            $t.add({
                title: 'Renamed page successfully!',
                color: 'success',
            })
        })
    }

    /**
     * Batch rename pages
     * @param pageUUIDs Array of page UUIDs to rename
     * @param operation Rename operation to perform
     * @param options Additional options for batch renaming
     */
    const renamePages = (
        pageUUIDs: string[],
        operation: RenameOperation,
        options?: {
            numberingStart?: number,
            numberingPadding?: number,
            numberingPrefix?: string,
            numberingSuffix?: string
        }
    ): void => {
        pageUUIDs.forEach((uuid, index) => {
            let finalOperation = { ...operation }

            // Handle sequential numbering if specified in options
            if (options?.numberingStart !== undefined) {
                const number = options.numberingStart + index
                const paddedNumber = String(number).padStart(
                    options.numberingPadding || 1,
                    '0'
                )
                const numberString = `${options.numberingPrefix || ''}${paddedNumber}${options.numberingSuffix || ''}`

                // Modify the operation to include the numbering
                switch (operation.type) {
                    case 'prefix':
                        finalOperation.value = `${operation.value}${numberString}`
                        break
                    case 'suffix':
                        finalOperation.value = `${numberString}${operation.value}`
                        break
                    case 'replace':
                        // If it's a replace operation, we'll append the number to the replacement
                        finalOperation.replaceValue = `${operation.replaceValue}${numberString}`
                        break
                }
            }

            renamePage(uuid, finalOperation)
        })
    }

    /**
     * Set the title of a page
     * @param pageUUID UUID of the page
     * @param name New title for the page
     */
    const setPageTitle = (pageUUID: string, name: string) => {
        if(pageMap.value.get(pageUUID) == null)
            rebuildPageMap()

        // @ts-ignore please shut the fuck up
        pageMap.value.get(pageUUID).name = name
        setSlatePageData(pageUUID, {
            name
        })
    }

    // const createSlatePage = async (newPageUUID: string) => {
    //     if (!isSaved.value) {
    //         await useNoteSaver().saveNote()
    //     }
    //
    //     currentSlateDoc.value?.pages.push(defaultSlatePage(newPageUUID))
    //     navigateTo(`/document/${newPageUUID}`)
    // }

    type PagePathNode = {
        uuid: string,
        name: string,
        icon: string,
    }

    /**
     * Gets the path from root to the specified page
     * @param targetUUID UUID of the target page
     * @returns Array of pages representing the path, ordered from root to target
     */
    const getCurrentNestedPageDirs = (targetUUID: MaybeRef<string> | ComputedRef<string>): PagePathNode[] => {
        const uuid = unref(targetUUID)
        const path: PagePathNode[] = []

        if (!currentSlateDoc.value) return path

        // Helper function to find path recursively
        const findPath = (pages: SlatePage[], targetId: string, parentPath: PagePathNode[] = []): boolean => {
            for (const page of pages) {
                const currentPath = [...parentPath, {
                    uuid: page.uuid,
                    name: page.name || 'Untitled',
                    icon: page.icon || 'lucide:file',
                } satisfies PagePathNode]

                if (page.uuid === targetId) {
                    path.push(...currentPath)
                    return true
                }

                if (page.children?.length && findPath(page.children, targetId, currentPath)) {
                    return true
                }
            }
            return false
        }

        findPath(currentSlateDoc.value.pages, uuid)
        return path
    }

    /**
     * Alternative implementation using the page map for potentially better performance
     * with very deep structures
     */
    const getCurrentNestedPageDirsPerformant = (targetUUID: MaybeRef<string> | ComputedRef<string>): PagePathNode[] => {
        const uuid = unref(targetUUID)
        const path: PagePathNode[] = []

        if (!currentSlateDoc.value) return path

        // Start with the target page
        let currentPage = pageMap.value.get(uuid)
        if (!currentPage) return path

        // Helper function to find parent
        const findParent = (childId: string): SlatePage | undefined => {
            for (const [_, page] of pageMap.value) {
                if (page.children?.some(child => child.uuid === childId)) {
                    return page
                }
            }
            return undefined
        }

        // Build path from target to root
        const reversePath: PagePathNode[] = []
        while (currentPage) {
            reversePath.push({
                uuid: currentPage.uuid,
                name: currentPage.name || 'Untitled',
                icon: currentPage.icon || 'lucide:file',
            } satisfies PagePathNode)

            // Find the parent
            currentPage = findParent(currentPage.uuid)
        }

        // Reverse the path to get root->target order
        return reversePath.reverse()
    }

    // Clear expansion state when loading new document
    const setSlateDocument = (doc: SlateDocument) => {
        currentSlateDoc.value = doc
        // expandedNodes.value.clear() // Clear expansion state
        rebuildPageMap()
    }

    const cacheExpandedNode = (nodeId: string) => {
        expandedTreeNodes.value.push(nodeId)
    }

    const uncacheExpandedNode = (nodeId: string) => {
        expandedTreeNodes.value = expandedTreeNodes.value.filter(i => i !== nodeId)
    }

    const clearExpandedNodeCache = () => {
        expandedTreeNodes.value = []
    }

    const getExpandedNodeCache = () => {
        return expandedTreeNodes
    }

    /**
     * Gets the parent page of a given page UUID
     * @param pageUUID UUID of the page to find parent for
     * @returns Parent SlatePage or undefined if no parent (root level) or page not found
     */
    const getPageParent = (pageUUID: string): SlatePage | undefined => {
        // Check if page exists
        if (!pageMap.value.has(pageUUID)) return undefined

        // Look through all pages to find parent
        for (const [_, page] of pageMap.value) {
            if (page.children?.some(child => child.uuid === pageUUID)) {
                return page
            }
        }

        return undefined
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
        createSlatePage,
        addChildPage,
        rebuildPageMap,
        movePage,
        deletePage,
        deletePages,
        movePages,
        renamePage,
        renamePages,
        setPageTitle,
        getCurrentNestedPageDirsPerformant,
        getCurrentNestedPageDirs,
        cacheExpandedNode,
        uncacheExpandedNode,
        clearExpandedNodeCache,
        getExpandedNodeCache,
        getPageParent,
        clearFile
    }
}