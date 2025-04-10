<script setup lang="ts">

import type { Editor } from '@tiptap/vue-3'
import { SlateModalDocumentInformation, SlateModalNodesView, SlateSlideoverPagesTree } from '#components'

const props = defineProps<{
    editor: Editor | undefined,
    pageId: string
}>()

defineShortcuts({
    meta_g: {
        usingInput: true,
        handler: () => {
            isOpenedPageTreeSlideover.value = !isOpenedPageTreeSlideover.value
            if(isOpenedPageTreeSlideover.value) {
                pagesTree()
            }else {
                slatePageTreeSliderover.close()
            }
        },
    },
    meta_shift_g: {
        usingInput: true,
        handler: () => {
            isOpenedNodesView.value = !isOpenedNodesView.value
            if(isOpenedNodesView.value) {
                nodesView()
            }else {
                slateNodesViewModal.close()
            }
        }
    },
})

const $editor = computed(() => props.editor)
const $m = useOverlay(), $t = useToast()
const $slate = useSlateFile()
const $slateCommon = useSlateCommon()

const slateDocInfoModal = $m.create(SlateModalDocumentInformation)
const slatePageTreeSliderover = $m.create(SlateSlideoverPagesTree)
const slateNodesViewModal = $m.create(SlateModalNodesView)
const isOpenedPageTreeSlideover = ref(false), isOpenedNodesView = ref(false)

function documentInformation() {
    return `${$editor.value?.storage.characterCount.words()} Words, ${$editor.value?.storage.characterCount.characters()} Characters`
}

function pagesTree() {
    slatePageTreeSliderover.open({
        pages: $slate.getCurrentSlateDoc().value?.pages,
        currentPage: props.pageId,
    })
}

function nodesView() {
    slateNodesViewModal.open({
        currentPage: props.pageId,
    })
}

</script>

<template>
    <div class="fixed bottom-0 right-0 w-fit h-fit z-10 p-1 print:hidden">
        <div class="w-fit flex flex-col items-center justify-end rounded-lg backdrop-blur-md p-1 gap-1 select-none">
            <UTooltip :text="documentInformation()" :delay-duration="200">
                <UButton
                    icon="lucide:info"
                    size="xs"
                    variant="ghost"
                    @click="() => {
                        slateDocInfoModal.open({
                            wordCount: $editor?.storage.characterCount.words(),
                            charCount: $editor?.storage.characterCount.characters()
                        })
                    }"
                />
            </UTooltip>
            <UTooltip :kbds="['meta', 'G']" text="Page Trees">
                <UButton icon="lucide:list-tree" size="xs" variant="ghost" @click="() => { pagesTree() }"/>
            </UTooltip>
            <UTooltip :kbds="['meta', 'shift', 'G']" text="Nodes View">
                <UButton icon="lucide:network" size="xs" variant="ghost" @click="() => { nodesView() }"/>
            </UTooltip>
        </div>
    </div>
</template>

<style scoped>

</style>