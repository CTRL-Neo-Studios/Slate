<script setup lang="ts">
import { nodeViewProps, NodeViewWrapper, NodeViewContent } from '@tiptap/vue-3'

const props = defineProps(nodeViewProps)
const isOpen = ref(props.node.attrs.isOpen)
const contentRef = ref<HTMLElement | null>(null)
const contentHeight = ref('0')

const toggleAccordion = () => {
    isOpen.value = !isOpen.value

    // Update the height for animation
    if (isOpen.value && contentRef.value) {
        contentHeight.value = `${contentRef.value?.scrollHeight}px`
    } else {
        contentHeight.value = '0'
    }

    props.updateAttributes({
        isOpen: isOpen.value
    })
}

nextTick(() => {
    if(isOpen.value) {
        contentHeight.value = `${contentRef.value?.scrollHeight}px`
    }
})
</script>

<template>
    <node-view-wrapper>
        <div class="my-4 rounded-lg bg-(--ui-bg-elevated)/50 ring ring-(--ui-border) divide-y divide-(--ui-border)">
            <!-- Header -->
            <button
                @click="toggleAccordion"
                :class="['flex w-full items-center justify-between px-4 py-3 text-sm font-medium focus:outline-none transition-all duration-300 rounded-lg', isOpen ? 'border-(--ui-border)' : '']"
            >
                <span contenteditable="false">{{ props.node.attrs.title }}</span>
                <Suspense>
                    <Icon
                        name="lucide:chevron-left"
                        :class="[
                            'size-4 transform transition-transform duration-300',
                            isOpen ? '-rotate-90' : 'rotate-0'
                        ]"
                    />
                </Suspense>
            </button>

            <!-- Content -->
            <div
                ref="contentRef"
                :style="{ height: contentHeight }"
                :class="['overflow-hidden transition-all duration-300 ease-in-out rounded-lg', isOpen ? 'border-(--ui-border)' : '']"
            >
                <div class="px-4 py-3">
                    <node-view-content
                        class="custom-prose max-w-none"
                    />
                </div>
            </div>
        </div>
    </node-view-wrapper>
</template>

<style>
.ProseMirror {
    @apply outline-none;
}

[data-type="accordion"] {
    @apply relative;
}

[data-type="accordion"] .ProseMirror {
    @apply min-h-[1.5rem] cursor-text;
}

/* Add these animation styles */
@keyframes slideDown {
    from {
        height: 0;
        opacity: 0;
    }
    to {
        height: var(--content-height);
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        height: var(--content-height);
        opacity: 1;
    }
    to {
        height: 0;
        opacity: 0;
    }
}

.ProseMirror-selectednode {
    @apply ring-(--ui-primary) ring-2
}
</style>
