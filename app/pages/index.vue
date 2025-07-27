<script setup lang="ts">
import { useSlateFile } from '~/composables/useSlateFile'
import { useNoteImporter } from '~/composables/useNoteImporter'
import { useSlateConfig } from '~/composables/useSlateConfig'
import { useAppMenu } from '~/composables/useAppMenu'

const $slate = useSlateFile()
const $import = useNoteImporter()
const $config = useSlateConfig()
const $route = useRoute()
const $appMenu = useAppMenu()
const configLoaded = computed(() => $config.isGlobalConfigLoaded())

onMounted(async () => {
    await $config.initGlobalConfig()
    await $appMenu.init()
})

function createDoc() {
    $slate.createSlateDocument()
    //
}

function openDoc() {
    $import.importNote()
}

async function openSettings() {
    await $config.openConfig($route.fullPath)
}
</script>
<template>
    <div>
        <Transition class="transition-all duration-500 h-fit w-fit" enter-active-class="blur-sm opacity-0" leave-active-class="blur-sm opacity-0">
            <div v-if="configLoaded" class="w-full min-h-screen flex flex-col items-center justify-center prose max-w-none dark:prose-invert">
                <h1 class="mb-0">Welcome to Slate👋</h1>
                <p>We hope you enjoy the ride 😊~</p>
                <div class="grid-cols-3 gap-4 grid">
                    <UButton class="text-center flex-col size-24 justify-center items-center" variant="soft" @click="createDoc()">
                        <Icon name="lucide:plus" class="size-8"/>
                        <div>New Doc</div>
                    </UButton>
                    <UButton class="text-center flex-col size-24 justify-center items-center" variant="soft" @click="openDoc()">
                        <Icon name="lucide:file" class="size-8"/>
                        <div>Open...</div>
                    </UButton>
                    <UButton class="text-center flex-col size-24 justify-center items-center" variant="soft" @click="openSettings()">
                        <Icon name="lucide:settings" class="size-8"/>
                        <div>Settings</div>
                    </UButton>
                </div>
            </div>
            <div v-else class="w-full min-h-screen flex flex-col items-center justify-center">
                <div class="text-sm opacity-70 animate-pulse">Loading Settings...</div>
            </div>
        </Transition>
    </div>
</template>
