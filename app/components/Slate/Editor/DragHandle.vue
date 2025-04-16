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
</script>

<template>
    <!--ignore-->
    <DragHandle :editor v-if="editor" class="mr-0" :on-node-change="nodeData.callback">
        <UDropdownMenu size="sm" :items="[
            [
                {
                    label: 'Copy Block',
                    icon: 'lucide:copy',
                    onSelect() {
                        const cpos = unref(nodeData.currentNodePosition)
                        props.editor?.chain().setNodeSelection(cpos).run()

                        // TODO: Deprecation soon; change it ASAP
                        window.document.execCommand('copy')
                    }
                },
                {
                    label: 'Duplicate',
                    icon: 'lucide:copy-plus',
                    onSelect() {
                        const cpos = unref(nodeData.currentNodePosition)
                        props.editor?.commands.setNodeSelection(cpos)

                        // @ts-ignore
                        const {$anchor} = props.editor?.state.selection
                        const selectedNode = $anchor.node(1) || (props.editor?.state.selection as NodeSelection).node

                        props.editor?.chain().insertContentAt(cpos + (unref(nodeData.currentNode)?.nodeSize || 0), selectedNode.toJSON()).run()
                    }
                }
            ],
            [
                {
                    label: 'Clear Formatting',
                    icon: 'lucide:remove-formatting',
                    onSelect() {
                        const chain = props.editor?.chain()
                        chain?.setNodeSelection(unref(nodeData.currentNodePosition)).unsetAllMarks()

                        if (unref(nodeData.currentNode)?.type.name !== 'paragraph') {
                            chain?.setParagraph()
                        }

                        chain?.run()
                    }
                },
                {
                    label: 'Delete Block',
                    color: 'error',
                    icon: 'lucide:trash-2',
                    onSelect() {
                        props.editor?.chain().setNodeSelection(nodeData.currentNodePosition.value).deleteSelection().run()
                    }
                }
            ]
        ]">
            <UButton size="xs" icon="lucide:grip" variant="ghost" />
        </UDropdownMenu>
    </DragHandle>
</template>

<style scoped>

</style>