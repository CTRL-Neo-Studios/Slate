import { useQuickToasts } from '~/composables/useQuickToasts'
import { useSlateDocument } from '~/composables/useSlateDocument'
import type { SdxPage } from '~/types/sdx.types'
import type { Editor } from '@tiptap/vue-3'

/**
 * A Wrapper layer over <code>useSlateDocument()</code> for single-current-page operations.
 */
export function useSlatePage() {
    const $qt = useQuickToasts()
    const $sdoc = useSlateDocument()

    const _currentPage = computed(() => {
        return $sdoc.getPages([useRoute().params.pageId as string])[0]
    })
    const _currentPageId = computed(() => {
        return useRoute().params.pageId as string
    })

    function updatePage(page: Partial<SdxPage>) {
        const cpage = unref(_currentPage)
        if (cpage == null) {
            $qt.error('Error', 'Current page is invalid.')
            return;
        }

        $sdoc.setPages([_currentPageId.value], [page])
    }

    function getRelations() {
        // The reason we're using _currentPage instead of _currentPageId here is because of there's a possibility that _currentPageId
        // has a UUID that does not have a corresponding page in the SdxPage buffer.

        const cpage = unref(_currentPage)
        if (cpage == null) {
            $qt.error('Error', 'Current page is invalid.')
            return;
        }

        return $sdoc.getPageRelations(cpage.uuid)
    }

    function getChildren() {
        const cpage = unref(_currentPage)
        if (cpage == null) {
            $qt.error('Error', 'Current page is invalid.')
            return;
        }

        return $sdoc.getPageChildren(cpage.uuid)
    }

    function getParent() {
        const cpage = unref(_currentPage)
        if (cpage == null) {
            $qt.error('Error', 'Current page is invalid.')
            return;
        }

        return $sdoc.getPageParent(cpage.uuid)
    }

    function updatePageContent(editor: Ref<Editor>) {
        const cpage = unref(_currentPage)
        if (cpage == null) {
            $qt.error('Error', 'Current page is invalid.')
            return;
        }

        $sdoc.setPages([cpage.uuid], [{
            content: editor
        }])
    }
}