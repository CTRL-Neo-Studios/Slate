<!-- components/Slate/Editor/Prose/WikiLink.vue -->
<script setup lang="ts">
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'

const props = defineProps(nodeViewProps)
const slateFile = useSlateFile()
const router = useRouter()

const pageId = computed(() => props.node.attrs.pageId || null)
const displayText = computed(() => props.node.attrs.displayText)

// Check if the link is valid by finding the page
const linkedPage = computed(() => {
    if (!pageId.value) return null
    return slateFile.getCurrentSlatePage(pageId.value)
})

// Determine link validity
const isValid = computed(() => !!linkedPage.value)

// Get the page path for tooltip
const pagePath = computed(() => {
    try {
        if (!isValid.value || !pageId.value) return ''

        const pathNodes = slateFile.getCurrentNestedPageDirs(pageId.value)
        if (!pathNodes || pathNodes.length <= 1) return ''

        // Return all nodes except the current page
        return pathNodes
            .slice(0, -1)
            .map(node => node.name)
            .join(' / ')
    } catch (err) {
        console.error('Error getting page path for tooltip:', err)
        return ''
    }
})

// Text to display in the link
const linkText = computed(() => {
    // If a display text is specified, use it
    if (displayText.value) {
        return displayText.value
    }

    // If the page exists, use its name
    if (linkedPage.value) {
        return linkedPage.value.name || 'Untitled'
    }

    // If not valid, use pageId as text (which may be a title that doesn't match a page)
    return pageId.value
})

// Navigate to the linked page
function navigateToPage() {
    if (isValid.value && pageId.value) {
        router.push(`/document/${pageId.value}`)
    } else if (pageId.value) {
        // Create a new page with title matching the link text
        const newPageId = useUUID()
        $t.add({
            title: 'Cannot open referred page; Page has either been deleted or cannot be referenced.',
            icon: 'lucide:circle-x',
            color: 'error'
        })
    }
}
</script>

<template>
    <NodeViewWrapper
        as="a"
        :class="[
      'wiki-link',
      { 'wiki-link--valid': isValid, 'wiki-link--invalid': !isValid }
    ]"
        @click.prevent="navigateToPage"
        :data-tooltip="pagePath ? `Located in: ${pagePath}` : undefined"
    >
        <UIcon
            :name="isValid ? linkedPage?.icon || 'lucide:file' : 'lucide:file-question'"
            class="wiki-link__icon"
        />
        {{ linkText }}
    </NodeViewWrapper>
</template>

<style>
.wiki-link {
    color: var(--primary);
    text-decoration: underline;
    cursor: pointer;
    border-radius: 0.25rem;
    padding: 0 2px;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    position: relative;
}

.wiki-link:hover {
    background-color: var(--primary-100);
}

.wiki-link:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--tooltip-bg, rgba(0, 0, 0, 0.8));
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    white-space: nowrap;
    pointer-events: none;
    z-index: 100;
    margin-bottom: 4px;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.wiki-link[data-tooltip]:hover::after {
    opacity: 1;
}

.wiki-link--invalid {
    color: var(--warning);
    text-decoration: dashed underline;
}

.wiki-link__icon {
    width: 0.875rem;
    height: 0.875rem;
    flex-shrink: 0;
}

/* For highlighting wiki link syntax while typing */
.wiki-link-syntax {
    background-color: rgba(var(--primary-500), 0.1);
    border-radius: 0.25rem;
}
</style>

