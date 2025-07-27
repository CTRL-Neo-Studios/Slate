<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'
import { DragHandle } from '@tiptap-pro/extension-drag-handle-vue-3'
import type { DropdownMenuItem } from '@nuxt/ui'
import { useTiptapNodeData } from '~/composables/useTiptapNodeData'
import type { NodeSelection } from 'prosemirror-state'

const props = defineProps<{
    editor: Editor | undefined
}>()

const nodeData = useTiptapNodeData()

function duplicate() {
    const cpos = unref(nodeData.currentNodePosition)
    props.editor?.commands.setNodeSelection(cpos)

    // @ts-ignore
    const {$anchor} = props.editor?.state.selection
    const selectedNode = $anchor.node(1) || (props.editor?.state.selection as NodeSelection).node

    props.editor?.chain().insertContentAt(cpos + (unref(nodeData.currentNode)?.nodeSize || 0), selectedNode.toJSON()).run()
}

function clearFormatting() {
    const chain = props.editor?.chain()
    chain?.setNodeSelection(unref(nodeData.currentNodePosition)).unsetAllMarks()

    if (unref(nodeData.currentNode)?.type.name !== 'paragraph') {
        chain?.setParagraph()
    }

    chain?.run()
}

function copyBlock() {
    const cpos = unref(nodeData.currentNodePosition)
    props.editor?.chain().setNodeSelection(cpos).run()

    // TODO: Deprecation soon; change it ASAP
    window.document.execCommand('copy')
}

function deleteBlock() {
    props.editor?.chain().setNodeSelection(nodeData.currentNodePosition.value).deleteSelection().run()
}

const items = ref<DropdownMenuItem[][]>([
    [
        {
            label: 'Copy Block',
            icon: 'lucide:copy',
            onSelect() {
                copyBlock()
            }
        },
        {
            label: 'Duplicate',
            icon: 'lucide:copy-plus',
            onSelect() {
                duplicate()
            }
        }
    ],
    [
        {
            label: 'Clear Formatting',
            icon: 'lucide:remove-formatting',
            onSelect() {
                clearFormatting()
            }
        },
        {
            label: 'Delete Block',
            color: 'error',
            icon: 'lucide:trash-2',
            onSelect() {
                deleteBlock()
            }
        }
    ]
])
</script>

<template>
    <!--ignore-->
    <DragHandle :editor v-if="editor" class="mr-0" :on-node-change="nodeData.callback">
        <UDropdownMenu size="sm" :items>
            <UButton size="xs" icon="lucide:grip" variant="ghost" />
        </UDropdownMenu>
    </DragHandle>
</template>

<style scoped>

</style>