<!-- components/Slate/Editor/WikiLinkSuggestion.vue -->
<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'

const props = defineProps({
    items: {
        type: Array,
        required: true
    },
    command: {
        type: Function,
        required: true
    },
    editor: {
        type: Object,
        required: true
    },
    range: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['close'])
const selectedIndex = ref(0)
const slateFile = useSlateFile()

const suggestionListRef = ref(null)

// Close on click outside
onClickOutside(suggestionListRef, () => {
    emit('close')
})

// Get page path/directory for display
const getPagePath = (pageId) => {
    try {
        if (!pageId || !slateFile.getCurrentNestedPageDirs) return ""

        // Get the path nodes except the last one (which is the page itself)
        const pathNodes = slateFile.getCurrentNestedPageDirs(pageId).slice(0, -1)

        // Return formatted path string
        if (pathNodes.length === 0) return ""

        let flattened = ""
        if(pathNodes.length > 1)
            flattened = pathNodes[0]?.name + ' / ... / '
        else
            pathNodes.map(node => node.name + ' / ').forEach((i: string) => {
                flattened += i
            })
        return flattened
    } catch (err) {
        console.error('Error getting page path:', err)
        return ""
    }
}

// Keyboard navigation
function handleKeyDown(event) {
    if (!props.items.length) return

    // Arrow up/down to navigate
    if (event.key === 'ArrowDown') {
        event.preventDefault()
        selectedIndex.value = (selectedIndex.value + 1) % props.items.length
    }

    if (event.key === 'ArrowUp') {
        event.preventDefault()
        selectedIndex.value = (selectedIndex.value - 1 + props.items.length) % props.items.length
    }

    // Enter to select
    if (event.key === 'Enter') {
        event.preventDefault()
        selectItem(selectedIndex.value)
    }

    // Tab to select
    if (event.key === 'Tab') {
        event.preventDefault()
        selectItem(selectedIndex.value)
    }

    // Escape to close
    if (event.key === 'Escape') {
        event.preventDefault()
        emit('close')
    }
}

// Add event listeners for keyboard navigation
onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeyDown)
})

function selectItem(index) {
    const item = props.items[index]
    if (item) {
        props.command({ id: item.uuid, title: item.name })
    }
}

// Make sure the selected item is visible
watch(selectedIndex, () => {
    nextTick(() => {
        const element = document.querySelector(`.wiki-link-item-${selectedIndex.value}`)
        if (element) {
            element.scrollIntoView({ block: 'nearest' })
        }
    })
})
</script>

<template>
    <div
        ref="suggestionListRef"
        class="backdrop-blur-md rounded-lg drop-shadow-sm p-1.5"
    >
        <div class="px-2 mb-2">
            <span class="text-sm font-bold">Select a page</span>
            <div class="wiki-link-suggestion-instructions">
                <span><UIcon name="lucide:arrow-up" class="w-3.5 h-3.5" /> <UIcon name="lucide:arrow-down" class="w-3.5 h-3.5" /> to navigate</span>
                <span><UIcon name="lucide:corner-down-left" class="w-3.5 h-3.5" /> to select</span>
            </div>
        </div>

        <div v-if="items.length" class="flex flex-col gap-1">
            <UButton
                v-for="(item, index) in items"
                :key="item.uuid || index"
                @click="selectItem(index)"
                :variant="index === selectedIndex ? 'solid' : 'ghost'"
                size="sm"
                class="justify-start"
                :icon="item.icon"
            >
                <span class="overflow-hidden overflow-ellipsis">
                    <span v-if="getPagePath(item.uuid)">
                        {{ getPagePath(item.uuid) }}
                    </span>
                    {{ item.name || 'Untitled' }}
                </span>
            </UButton>
        </div>
        <div v-else class="text-xs text-current/50 text-center p-1">
            No matching pages found
        </div>
    </div>
</template>

<style>
.wiki-link-suggestion {
    position: absolute;
    z-index: 30;
    background-color: var(--background);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    width: 320px;
    max-height: 380px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

.wiki-link-suggestion-header {
    padding: 0.75rem;
    border-bottom: 1px solid var(--border);
    background-color: var(--background-subtle);
}

.wiki-link-suggestion-title {
    font-weight: 600;
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
    display: block;
}

.wiki-link-suggestion-instructions {
    display: flex;
    gap: 1rem;
    font-size: 0.75rem;
    color: var(--gray-500);
}

.wiki-link-suggestion-instructions span {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.wiki-link-suggestion-list {
    display: flex;
    flex-direction: column;
    padding: 0.5rem;
    overflow-y: auto;
    flex-grow: 1;
}

.wiki-link-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem 0.75rem;
    margin: 0.125rem 0;
    border-radius: 0.375rem;
    text-align: left;
    border: none;
    background: transparent;
    cursor: pointer;
    width: 100%;
}

.wiki-link-item--selected,
.wiki-link-item:hover {
    background-color: var(--primary-50);
}

.wiki-link-item-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.wiki-link-item-icon {
    color: var(--primary);
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
}

.wiki-link-item-title {
    flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
}

.wiki-link-item-path {
    padding-left: 1.5rem;
    font-size: 0.75rem;
    color: var(--gray-500);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.wiki-link-suggestion-empty {
    padding: 1rem;
    text-align: center;
    color: var(--gray-500);
    font-style: italic;
}
</style>
