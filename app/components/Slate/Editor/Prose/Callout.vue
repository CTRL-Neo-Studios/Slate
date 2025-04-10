<script setup lang="ts">
import { nodeViewProps, NodeViewWrapper, NodeViewContent } from '@tiptap/vue-3'

const props = defineProps(nodeViewProps)

const color = ref<'error' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'neutral' | string | undefined>('primary')
const title = ref('Callout')
const icon = ref('lucide:info')
const variant = ref('subtle')

onMounted(() => {
    color.value = props.node.attrs.color
    title.value = props.node.attrs.title
    icon.value = props.node.attrs.icon
    variant.value = "solid"
})
</script>

<template>
    <node-view-wrapper class="my-4 w-full draggable-item dom">
        <UAlert :color :variant="'solid'" :title :icon>
            <template #description>
                <NodeViewContent style="width: 100%" class="content-dom text-sm"/>
            </template>
        </UAlert>
    </node-view-wrapper>
</template>

<style>
.ProseMirror-selectednode {
    @apply ring-(--ui-primary) ring-2
}
</style>