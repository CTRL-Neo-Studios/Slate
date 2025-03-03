<script setup lang="ts">
defineProps({
    wordCount: {
        type: Number,
        default: 0
    },
    charCount: {
        type: Number,
        default: 0
    }
})

const emit = defineEmits<{ close: [boolean] }>()
</script>

<template>
    <UModal
        :close="{ onClick: () => emit('close', false) }"
        title="Document Information">
        <template #body>
            <div class="grid w-full grid-cols-2 text-sm gap-2">
                <div class="text-left">Word Count</div>
                <div class="text-right">{{wordCount}}</div>
                <div class="text-left">Character Count</div>
                <div class="text-right">{{charCount}}</div>
            </div>
        </template>
    </UModal>
</template>

<style scoped>

</style>