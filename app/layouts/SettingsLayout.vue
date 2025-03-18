<script setup lang="ts">
const $route = useRoute()
const $config = useSlateConfig()
</script>

<template>
    <div>
        <div class="w-full fixed top-0 left-0 right-0 h-fit z-10" id="remove-during-print">
            <div class="flex items-center justify-center p-2 gap-2 select-none cursor-default" data-tauri-drag-region>
                <div class="flex items-center justify-center p-1 px-2 gap-2 rounded-lg backdrop-blur-md z-20 w-fit" data-tauri-drag-region>
                    <!--Ignore The Error Here... fucking typescript-->
                    <div class="inline-flex items-center text-center text-sm font-medium" data-tauri-drag-region>Settings</div>
                    <UButton icon="lucide:arrow-left" size="xs" @click="$config.closeConfig()" />
                </div>
            </div>
        </div>
        <slot/>
    </div>
</template>

<style scoped>

</style>