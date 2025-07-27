import type { SdxFileConfig, SdxFileMetadata, SdxPage, SdxPageTreeElement } from '~/types/sdx.types'
import { useSlateFileIO } from '~/composables/useSlateFileIO'
import { open, save } from '@tauri-apps/plugin-dialog'
import { useQuickToasts } from '~/composables/useQuickToasts'
import type { PossiblyRef } from '~/types/utility.types'
import type { Editor } from '@tiptap/vue-3'
import { sdxDefaults } from '~/utils/sdx_utils'
import { useSlateContentDb } from '~/composables/useSlateContentDb'
import { pages } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'

/**
 * The layer that manages the .sdx document as a whole. Including the Pages, metadata, and config.
 * The operating context is within the last saved/loaded file.
 *
 * How this works is that this composable acts as a buffer between the content and the file. The users edits the buffer
 * stored in this composable directly, and then when the save function is triggered, the FileIO composable writes the buffer
 * data into the file.
 */
export function useSlateDocument() {
    const $t = useToast()
    const $qt = useQuickToasts()
    const $con = useSlateContentDb()

    const $sio = useSlateFileIO()

    // Document Data Buffer
    const _docConfig = useState<SdxFileConfig | null>('sd.documentConfig', () => null)
    const _docMetadata = useState<SdxFileMetadata | null>('sd.documentMetadata', () => null)
    const _docTreeMap = useState<SdxPageTreeElement[]>('sd.documentTreeMap', () => [])
    const _docPages = useState<SdxPage[]>('sd.pages', () => [])

    /**
     * Gets the document stored in the buffer.
     */
    function getDocument() {
        return {
            config: _docConfig,
            metadata: _docMetadata
        }
    }

    /**
     * Loads the document into the buffer.
     */
    async function loadDocument() {
        try {
            const selectedFile = await open({
                filters: [{
                    name: 'Slate Document Extended Format',
                    extensions: ['sdx', 'md', 'txt'],
                }],
            })

            if (!selectedFile) {
                $qt.info('No file was selected.')
                return
            } else {
                const data = await $sio.loadFile(selectedFile)

                _docMetadata.value = data?.metadata
                _docConfig.value = data?.config
                await $con.setBufferPath(data?.bufferDir)
                await $con.setDbPath(data?.bufferDbDir)
                await $con.loadAndMigrateDb()
            }
        } catch (e: any) {
            $qt.error('Error', e.message as string)
        }
    }

    async function saveDocument() {
        try {
            if ($sio.isSdxFile()) {
                // .sdx file saving

                let targetPath
                if ($sio.isSdxFileNull()) {
                    targetPath = await save({
                        filters: [{
                            name: 'Slate Document Extended Format',
                            extensions: ['sdx'],
                        }],
                    })

                    if (!targetPath) {
                        $qt.error('Please choose a path to save the file to.')
                        return
                    }

                    $sio.setSdxFilePath(targetPath)
                }

                await $sio.saveSdxFile()
            } else {
                // headless-editing saving
                // if(!editor)
                //     throw new Error('Unable to retrieve page content due to unpassed parameters')
                //
                // const content =
                //     $sio.isMarkdownFile() ? unref(editor).storage.markdown.getMarkdown() :
                //     $sio.isTextFile() ? unref(editor).getText() : unref(editor).getText()
                //
                // await $sio.saveNonSdxFile(content)
            }
        } catch(e: any) {
            $qt.error('Error', `An error occurred whilst trying to save your document: ${e.message}`)
        }
    }

    async function newDocument() {

    }

    /**
     * Indexes the document's pages into a tree-children hierarchy.
     */
    function indexDocumentTree(): SdxPageTreeElement[] {
        const pages = _docPages.value;
        if (!pages || pages.length === 0) return [];

        // Create a map for quick lookup
        const pageMap = new Map<string, SdxPageTreeElement>();

        // First pass: create all tree elements without children
        pages.forEach(page => {
            pageMap.set(page.uuid, {
                uuid: page.uuid,
                name: page.name,
                icon: page.icon,
                children: []
            });
        });

        // Second pass: build the hierarchy
        const rootElements: SdxPageTreeElement[] = [];

        pages.forEach(page => {
            const treeElement = pageMap.get(page.uuid);
            if (!treeElement) return;

            // If it's a root page (empty parentPageId or parent not found)
            if (!page.parentPageId || !pageMap.has(page.parentPageId)) {
                rootElements.push(treeElement);
            } else {
                // Add to parent's children
                const parent = pageMap.get(page.parentPageId);
                if (parent) {
                    parent.children.push(treeElement);
                }
            }
        });

        _docTreeMap.value = rootElements
        return rootElements;
    }

    /**
     * Gets all the parent page UUIDs of the current page (from the page up to root).
     * @param pageUuid The UUID of the page to find parents for
     */
    function getPageParent(pageUuid: PossiblyRef<string>): string[] {
        const uuid = unref(pageUuid)
        const pages = _docPages.value
        const parentUuids: string[] = []

        let currentUuid = uuid
        let maxDepth = 100 // Prevent infinite loops in case of circular references

        while (currentUuid && maxDepth-- > 0) {
            const currentPage = pages.find(p => p.uuid === currentUuid)
            if (!currentPage || !currentPage.parentPageId) break

            parentUuids.push(currentPage.parentPageId)
            currentUuid = currentPage.parentPageId
        }

        return parentUuids
    }

    /**
     * Gets all the children page UUIDs of the current page (direct and nested).
     * @param pageUuid The UUID of the page to find children for
     */
    function getPageChildren(pageUuid: PossiblyRef<string>): string[] {
        const uuid = unref(pageUuid)
        const pages = _docPages.value
        const childrenUuids: string[] = []

        // Recursive function to collect all children
        const collectChildren = (parentId: string) => {
            const directChildren = pages.filter(p => p.parentPageId === parentId)
            for (const child of directChildren) {
                childrenUuids.push(child.uuid)
                collectChildren(child.uuid)
            }
        }

        collectChildren(uuid)
        return childrenUuids
    }

    /**
     * Gets all the indexed link reference relations to the current page.
     * @param pageUuid The UUID of the page to find relations for
     */
    function getPageRelations(pageUuid: PossiblyRef<string>): string[] {
        const uuid = unref(pageUuid)
        return _docPages.value
            .filter(page => page.reference_to.includes(uuid))
            .map(page => page.uuid)
    }

    /**
     * Gets all the pages by their UUIDs.
     * @param pageUuids Array of page UUIDs to retrieve
     */
    function getPages(pageUuids: PossiblyRef<string[]>): SdxPage[] {
        const uuids = unref(pageUuids)
        const uuidSet = new Set(uuids)
        return _docPages.value.filter(page => uuidSet.has(page.uuid))
    }

    /**
     * Efficiently updates multiple pages in the document
     * @param pageUuids Array of page UUIDs to update
     * @param updates Array of partial page updates (matched by index to pageUuids)
     */
    async function setPages(pageUuids: PossiblyRef<string[]>, updates: PossiblyRef<Partial<SdxPage>[]>) {
        const data = unref(updates)
        const uuids = unref(pageUuids)

        if (uuids.length != data.length)
            throw new Error('Lengths of arrays to update does not match')

        await $con.db().transaction(async (tx) => {
            for (let i = 0; i < uuids.length; i++) {
                await tx.update(pages)
                    .set(data[i] & { modifiedAt: new Date() })
                    .where(eq(pages.uuid, uuids[i]))
            }
        })
    }

    return {
        getDocument,
        loadDocument,
        saveDocument,
        indexDocumentTree,
        getPageParent,
        getPageChildren,
        getPageRelations,
        getPages,
        setPages
    }
}