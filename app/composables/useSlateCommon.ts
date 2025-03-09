import { SlateModalPageRename, SlateModalSelectIcon, SlateModalWarning } from '#components'
import type { PossiblyRef } from '~/utility.types'

export const useSlateCommon = () => {
    const $slate = useSlateFile()
    const $save = useNoteSaver()
    const $t = useToast(), $m = useOverlay()

    const changeIcon = (uuid: PossiblyRef<string>) => {
        if ($slate.getFilePath().value == null) {
            $t.add({
                title: 'Please save the file first.',
                color: 'warning',
            })
            return
        }

        const selectIconModal = $m.create(SlateModalSelectIcon, {
            props: {
                async onConfirm(newIcon: string) {
                    $slate.setSlatePageData(unref(uuid), { icon: newIcon })
                    $slate.setSavingFile(true)
                    $save.autoSave()
                    selectIconModal.close()
                },
            },
        })

        selectIconModal.open()
    }

    const renamePage = (uuid: PossiblyRef<string>, currentName: PossiblyRef<string>, callback: any = null) => {
        if ($slate.getFilePath().value == null) {
            $t.add({
                title: 'Please save the file first.',
                color: 'warning',
            })
            return
        }

        const pageRenameModal = $m.create(SlateModalPageRename, {
            props: {
                async onConfirm(newName: string) {
                    if (unref(currentName).trim()) {
                        $slate.setSavingFile(true)
                        $slate.renamePage(unref(uuid), {
                            type: 'rename',
                            value: '.*', // Replace entire name
                            replaceValue: newName.trim(),
                        })
                        $slate.setSavingFile(true)
                        $save.autoSave()
                    }
                    pageRenameModal.close()
                    if(callback != null)
                        callback()
                },
            },
        })
        pageRenameModal.open()
    }

    /**
     * Create a page.
     * @param mode Create Mode.
     * <ul>
     *     <li><code>'root'</code> would create the page in the root directory of the document</li>
     *     <li><code>'current'</code> would create the page in the same level as the target page</li>
     *     <li><code>'under'</code> would create the page as the child of the current page.</li>
     * </ul>
     * @param currentPageUUID The current Page's UUID
     */
    const createPage = async (mode: PossiblyRef<'root' | 'current' | 'under'>, currentPageUUID: PossiblyRef<string>) => {
        if ($slate.getFilePath().value == null) {
            $t.add({
                title: 'Please save the file first.',
                color: 'warning',
            })
            return
        }

        let opMode: 'root' | 'current' | 'under' = unref(mode)
        if (opMode == 'root'){
            await $slate.createSlatePage(useUUID())
        } else if (opMode == 'current') {
            let parent = $slate.getPageParent(unref(currentPageUUID))
            if(!parent){
                $t.add({
                    title: 'Error',
                    description: 'No parent found for the current page.',
                    color: 'error',
                })
                return
            }
            await $slate.createSlatePage(useUUID(), parent.uuid)
        } else if (opMode == 'under') {
            await $slate.createSlatePage(useUUID(), unref(currentPageUUID))
        }

        $save.autoSave()
    }

    const deletePage = (uuid: string, recursive: boolean = true) => {
        if ($slate.getFilePath().value == null) {
            $t.add({
                title: 'Please save the file first.',
                color: 'warning',
            })
            return
        }

        let hasChildren: boolean = (($slate.getCurrentSlatePage(uuid)?.children.length || 0) > 0) && recursive

        const warningModal = $m.create(SlateModalWarning, {
            props: {
                title: 'Deleting Page',
                description: `Are you sure you want to delete this page${hasChildren ? ' and its children' : ''}?`,
                async onConfirm() {
                    $slate.deletePage(uuid, recursive) // true for recursive deletion
                    useNoteSaver().autoSave()
                    warningModal.close()
                },
            },
        })
        warningModal.open()
    }

    return {
        renamePage,
        changeIcon,
        createPage,
        deletePage
    }
}