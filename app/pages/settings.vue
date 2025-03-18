<script setup lang="ts">
import type { SlateConfig, SlateDocumentConfig } from '~/types/slate.types'

definePageMeta({
    layout: 'settings-layout'
})

const $config = useSlateConfig()
const docConf = ref<SlateDocumentConfig>(defaultSlateDocumentConfig()), slateConf = ref<SlateConfig>(defaultSlateConfig())

const systemThemeSelections = [
    {
        label: 'System',
        value: 'system',
    },
    {
        label: 'Light',
        value: 'light',
    },
    {
        label: 'Dark',
        value: 'dark',
    }
]
onMounted(() => {
    docConf.value = $config.getDocumentConfig()
    slateConf.value = $config.getGlobalConfig()
})

watch(docConf, async (newConf) => {
    console.log(newConf)
    await $config.updateDocumentConfig(newConf)
}, { deep: true })

watch(slateConf, async (newConf) => {
    console.log(newConf)
    await $config.updateGlobalConfig(newConf)
}, { deep: true })
</script>

<template>
    <div>
        <div class="w-full flex items-start justify-center">
            <div class="flex flex-col gap-2 pt-16 sm:w-xl md:w-2xl w-3xl lg:w-4xl xl:w-5xl">
                <div class="prose-sm prose prose-zinc dark:prose-invert pb-2">
                    <h1>Global Settings</h1>
                </div>
                <SlateSettingsField title="Color Theme" desc="The editor's color theme.">
                    <USelect :items="configThemeColors()" v-model="slateConf.colorTheme"/>
                </SlateSettingsField>
                <SlateSettingsField title="Background Theme" desc="The editor's background theme.">
                    <USelect :items="configBackgroundThemeColors()" v-model="slateConf.backgroundTheme"/>
                </SlateSettingsField>
                <SlateSettingsField title="System Theme" desc="Dark, Light, or Automatic.">
                    <USelect :items="systemThemeSelections" v-model="slateConf.defaultEditorTheme"/>
                </SlateSettingsField>
                <SlateSettingsField title="Auto-Save Time" desc="Set the seconds between auto-save intervals.">
                    <UInputNumber :min="1" :max="30" v-model="slateConf.autosaveInterval"/>
                </SlateSettingsField>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>