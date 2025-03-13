<script setup lang="ts">
import type { SlateButtonComponent } from '~/types/slate_components.types'

const emit = defineEmits(['event'])
const props = defineProps<{ comp: SlateButtonComponent }>()
const $sheet = useSlateSheet()
</script>

<template>
    <UButton :label="comp.config.label" :disabled="comp.config.disabled" v-if="comp.config.visible" :variant="comp.config.variant" :icon="comp.config.icon"/>
</template>

<style scoped>

</style>