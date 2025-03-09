<script setup lang="ts">
const name = ref('')
const $t = useToast()
const input = ref()

const emit = defineEmits(['confirm', 'close'])

defineShortcuts({
    enter: {
        usingInput: true,
        handler: () => {
            onConfirm(name.value)
        }
    }
})

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

const $slateCommon = useSlateCommon()

function closeModal() {
    emit('close', false)
}

const handleRename = (uuid: string, currentName: string) => {
    $slateCommon.renamePage(uuid, currentName)
}

const handleDelete = (uuid: string, recursive: boolean) => {
    $slateCommon.deletePage(uuid, recursive)
}

const handleCreatePage = async (mode: 'root' | 'current' | 'under', targetPageUUID: string) => {
    await $slateCommon.createPage(mode, targetPageUUID)
}

const handleChangeIcon = (uuid: string) => {
    $slateCommon.changeIcon(uuid)
}
</script>

<template>
    <UModal title="Page Rename" class="z-10"
            :close="{ onClick: () => closeModal() }">
        <template #body>
            <UInput autofocus v-model="name" placeholder="New Page Name" class="w-full"/>
        </template>
        <template #footer>
            <div class="flex gap-2 w-full justify-end items-center">
                <UButton color="neutral" :label="'Cancel'" @click="closeModal()" />
                <UButton color="warning" :label="'Confirm'" @click="onConfirm(name)" />
            </div>
        </template>
    </UModal>
</template>

<style scoped>

</style>