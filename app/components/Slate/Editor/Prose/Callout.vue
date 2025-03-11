<!-- components/Amulet/Prose/Callout.vue -->
<script setup lang="ts">
import { nodeViewProps, NodeViewWrapper, NodeViewContent } from '@tiptap/vue-3'

const props = defineProps(nodeViewProps)

const color = ref<'error' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'neutral' | string | undefined>('primary')
const title = ref('Callout')
const icon = ref('lucide:info')
const variant = ref('solid')

const borderColor = computed(() => {
    if (color.value === 'primary') return 'var(--primary)'
    return `var(--${color.value}-400)`
})

onMounted(() => {
    color.value = props.node.attrs.color
    title.value = props.node.attrs.title
    icon.value = props.node.attrs.icon
    variant.value = props.node.attrs.variant
})
</script>

<template>
    <node-view-wrapper class="my-4 w-full">
        <UAlert :title :color :icon :variant>
            <template #description class="prose dark:prose-invert prose-sm">
                <NodeViewContent style="width: 100%"/>
            </template>
        </UAlert>
    </node-view-wrapper>
</template>

<style>
</style>