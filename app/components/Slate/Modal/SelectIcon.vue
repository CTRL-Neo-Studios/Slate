<script setup lang="ts">
const search = ref('')
const icons = ref<string[]>([])
const selectedIcon = ref('')
const loading = ref(true)
const currentPage = ref(1)
const itemsPerPage = 70
const scrollAreaRef = ref<HTMLElement | null>(null)

// Fetch icons when component mounts
onMounted(async () => {
    try {
        loading.value = true
        const response = await $fetch('https://api.iconify.design/collection?prefix=lucide') as any
        icons.value = response?.uncategorized || []
    } catch (error) {
        console.error('Failed to fetch icons:', error)
        icons.value = []
    } finally {
        loading.value = false
    }
})

// Filter icons based on search
const filteredIcons = computed(() => {
    return icons.value.filter(icon =>
        icon.toLowerCase().includes(search.value.toLowerCase())
    )
})

// Paginate filtered icons
const paginatedIcons = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredIcons.value.slice(start, end)
})

// Handle page change
const onPageChange = (page: number) => {
    currentPage.value = page
    // Scroll back to top of icon grid
    if (scrollAreaRef.value) {
        scrollAreaRef.value.scrollTop = 0
    }
}

// Reset to first page when search changes
watch(search, () => {
    currentPage.value = 1
})

// Emit the selected icon
const emit = defineEmits(['update:modelValue', 'confirm'])
const onIconSelect = (icon: string) => {
    selectedIcon.value = icon
    emit('update:modelValue', icon)
}

const onConfirm = (newIcon: string) => {
    selectedIcon.value = newIcon
    emit('confirm', `lucide:${newIcon}`)
}
</script>

<template>
    <UModal title="Select Icon">
        <template #title>
            <div class="flex items-center gap-3">
                <div>Select Icon</div>
                <UInput v-model="search" placeholder="Search..." leading-icon="lucide:search"/>
            </div>
        </template>
        <template #body>
            <div class="w-full grid grid-cols-10 gap-1">
                <div class="w-full h-full flex items-center" v-for="(item, index) in paginatedIcons" :key="index">
                    <UButton variant="ghost" size="sm" :icon="`lucide:${item}`" @click="() => {
                        onConfirm(item)
                        onIconSelect(item)
                    }"/>
                </div>
            </div>
        </template>
        <template #footer>
            <div class="flex items-center justify-center w-full">
                <UPagination v-model:page="currentPage" :disabled="search != ''" :items-per-page="itemsPerPage" :total="icons.length"/>
            </div>
        </template>
    </UModal>
</template>

<style scoped>

</style>