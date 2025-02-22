<script setup lang="ts">
const name = ref('')
const modal = useModal()
const $t = useToast()
const input = ref()

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

onMounted(() => {
    input.value?.focus()
})
</script>

<template>
    <UModal title="Page Rename" class="z-10">
        <template #body>
            <UInput ref="input" v-model="name" placeholder="New Page Name" class="w-full"/>
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