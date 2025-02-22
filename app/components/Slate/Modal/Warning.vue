<script setup lang="ts">
const modal = useModal()

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

const emit = defineEmits(['confirm'])

function onConfirm() {
    emit('confirm')
}
</script>

<template>
    <UModal class="z-10">
        <template #footer>
            <div class="flex gap-2 w-full justify-end items-center">
                <UButton color="neutral" :label="optCancelLabel" @click="modal.close()" />
                <UButton color="warning" :label="optConfirmLabel" @click="onConfirm" />
            </div>
        </template>
    </UModal>
</template>

<style scoped>

</style>