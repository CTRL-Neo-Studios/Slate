<script setup lang="ts">
import { nodeViewProps, NodeViewWrapper, NodeViewContent } from '@tiptap/vue-3'

const props = defineProps(nodeViewProps)

const variant = ref<'solid' | 'outline' | 'soft' | 'subtle' | undefined>('solid')

onMounted(() => {
    variant.value = props.node.attrs.variant
})
</script>

<template>
    <node-view-wrapper class="my-4 w-full p-0">
        <UCard :variant :ui="{
            body: 'p-4 sm:p-4',
        }">
            <template #default class="custom-prose">
                <NodeViewContent style="width: 100%"/>
            </template>
        </UCard>
    </node-view-wrapper>
</template>

<style>
.ProseMirror-selectednode {
    @apply ring-(--ui-primary) ring-2
}
</style>