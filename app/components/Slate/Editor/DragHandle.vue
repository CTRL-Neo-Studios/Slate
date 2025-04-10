<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'
import { DragHandle } from '@tiptap-pro/extension-drag-handle-vue-3'
import type { DropdownMenuItem } from '@nuxt/ui'

const props = defineProps<{
    editor: Editor | undefined
}>()

const dragHandleDropdownItems = ref<DropdownMenuItem[][]>([
    [
        {

        }
    ]
])
</script>

<template>
    <DragHandle :editor v-if="editor" class="mr-0">
        <UButton size="xs" icon="lucide:grip" variant="ghost"/>
    </DragHandle>
</template>

<style scoped>

</style>