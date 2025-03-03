<script setup lang="ts">

defineProps({
    optCancelLabel: {
        type: String,
        default: 'Cancel'
    },
    optConfirmLabel: {
        type: String,
        default: 'Confirm'
    }
})

const emit = defineEmits(['confirm', 'close'])

function onConfirm() {
    emit('confirm')
}

function closeModal() {
    emit('close', false)
}
</script>

<template>
    <UModal class="z-10">
        <template #footer>
            <div class="flex gap-2 w-full justify-end items-center">
                <UButton color="neutral" :label="optCancelLabel" @click="closeModal()" />
                <UButton color="warning" :label="optConfirmLabel" @click="onConfirm" />
            </div>
        </template>
    </UModal>
</template>

<style scoped>

</style>