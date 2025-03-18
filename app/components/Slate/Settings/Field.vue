<script setup lang="ts">
defineProps<{
    title?: string,
    desc?: string,
}>()
</script>

<template>
    <div class="w-full grid grid-cols-2 py-1">
        <div class="flex flex-col w-full items-start justify-center gap-1">
            <div class="text-sm font-bold">{{title}}</div>
            <div class="text-xs opacity-70">{{desc}}</div>
        </div>
        <div class="flex items-center justify-end gap-1">
            <div class="flex-grow"/>
            <div class="flex items-center justify-center gap-1 w-fit">
                <slot/>
            </div>
        </div>
    </div>
    <USeparator class="w-full"/>
</template>

<style scoped>

</style>