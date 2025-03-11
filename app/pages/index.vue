<script setup lang="ts">
const $slate = useSlateFile()
const $import = useNoteImporter()

function createDoc() {
    $slate.createSlateDocument()
}

function openDoc() {
    $import.importNote()
}
</script>
<template>
    <div>
        <div class="w-full min-h-screen flex flex-col items-center justify-center prose max-w-none dark:prose-invert">
            <h1 class="mb-0">Welcome to Slate👋</h1>
            <p>We hope you enjoy the ride 😊~</p>
            <div class="grid-cols-2 gap-4 grid">
                <UButton class="text-center flex-col size-24 justify-center items-center" variant="soft" @click="createDoc()">
                    <Icon name="lucide:plus" class="size-8"/>
                    <div>New Doc</div>
                </UButton>
                <UButton class="text-center flex-col size-24 justify-center items-center" variant="soft" @click="openDoc()">
                    <Icon name="lucide:file" class="size-8"/>
                    <div>Open...</div>
                </UButton>
            </div>
        </div>
    </div>
</template>
