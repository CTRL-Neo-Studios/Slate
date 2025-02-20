<script setup lang="ts">
const name = ref('')
const modal = useModal()
const $t = useToast()

const emit = defineEmits(['confirm'])

function onConfirm(newName: string) {
    if(name.value.length < 2){
        $t.add({
            title: 'Error',
            description: 'Page Name cannot be less than 2 characters.',
            color: 'error',
            icon: 'lucide:circle-x'
        })
        return
    }
    emit('confirm', newName)
}
</script>

<template>
    <UModal title="Page Rename">
        <template #body>
            <UInput v-model="name"/>
        </template>
        <template #footer>
            <div class="flex gap-2 w-full justify-end items-center">
                <UButton color="neutral" :label="'Cancel'" @click="modal.close()" />
                <UButton color="warning" :label="'Confirm'" @click="onConfirm(name)" />
            </div>
        </template>
    </UModal>
</template>

<style scoped>

</style>