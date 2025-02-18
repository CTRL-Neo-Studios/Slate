<script setup lang="ts">

onMounted(() => {
    $appMenu.init(editor)
})

const props = defineProps({
    showBottomBar: {
        type: Boolean,
        default: false
    }
})

const $appMenu = useAppMenu()
const $save = useNoteSaver()
const $state = useFileState()

const editor = useSlateEditor(() => {
    $state.setSavedStatus(false);
    // This callback is called once the content inside the editor is updated
    if ($state.getFilePath().value != null) {

        $save.autoSave(editor)
    }
})

onBeforeUnmount(() => {
    unref(editor)?.destroy();
});

const buttonVariant = (toggled: boolean | undefined) => {
    // console.log(toggled)
    return (toggled || false) ? 'subtle' : 'ghost'
};

const boldToggled = computed(() => buttonVariant(editor.value?.isActive('bold')))
const italicToggled = computed(() => buttonVariant(editor.value?.isActive('italic')))
const strikeToggled = computed(() => buttonVariant(editor.value?.isActive('strike')))
const underlinedToggled = computed(() => buttonVariant(editor.value?.isActive('underlined')))
const codeToggled = computed(() => buttonVariant(editor.value?.isActive('code')))

const textStylesSelect = [
    {
        label: 'Paragraph',
        value: 'paragraph',
        icon: 'lucide:pilcrow'
    },
    {
        label: 'Heading-1',
        value: 'heading-1',
        icon: 'lucide:heading-1'
    },
    {
        label: 'Heading-2',
        value: 'heading-2',
        icon: 'lucide:heading-2'
    },
    {
        label: 'Heading-3',
        value: 'heading-3',
        icon: 'lucide:heading-3'
    },
    {
        label: 'Heading-4',
        value: 'heading-4',
        icon: 'lucide:heading-4'
    },
    {
        label: 'Code',
        value: 'code',
        icon: 'lucide:code',
    }
]

const currentTextStyle = computed(() => {
    return editor.value?.isActive('heading', { level: 1 }) ? 'heading-1' :
        editor.value?.isActive('heading', { level: 2 }) ? 'heading-2' :
            editor.value?.isActive('heading', { level: 3 }) ? 'heading-3' :
                editor.value?.isActive('heading', { level: 4 }) ? 'heading-4' :
                    editor.value?.isActive('heading', { level: 5 }) ? 'heading-5' :
                        editor.value?.isActive('heading', { level: 6 }) ? 'heading-6' :
                            editor.value?.isActive('codeBlock') ? 'code' : 'paragraph'
})
function setStyle(value: string) {
    switch (value) {
        case "paragraph":
            editor.value?.chain().focus().setParagraph().run();
            break;
        case "heading-1":
            editor.value?.chain().focus().toggleHeading({ level: 1 }).run();
            break;
        case "heading-2":
            editor.value?.chain().focus().toggleHeading({ level: 2 }).run();
            break;
        case "heading-3":
            editor.value?.chain().focus().toggleHeading({ level: 3 }).run();
            break;
        case "heading-4":
            editor.value?.chain().focus().toggleHeading({ level: 4 }).run();
            break;
        case "heading-5":
            editor.value?.chain().focus().toggleHeading({ level: 5}).run();
            break;
        case "heading-6":
            editor.value?.chain().focus().toggleHeading({ level: 6 }).run();
            break;
        case "code":
            editor.value?.chain().focus().toggleCodeBlock().run();
            break;
    }
}

</script>

<template>
    <div>
        <slot name="top-bar" :editor="editor"/>
        <div class="w-full fixed top-0 left-0 right-0 h-fit z-10">
            <div class="flex items-center justify-center p-2 gap-2 select-none cursor-default">
                <div class="flex items-center justify-center p-1 px-2 gap-2 rounded-lg backdrop-blur-md">
                    <div class="text-center text-sm">{{ $state.getFileName() }}</div>
                    <Icon name="lucide:file-warning" class="size-3" v-if="$state.getFilePath().value == null || ''"/>
                    <template v-else>
                        <UTooltip :text="$state.isFileSaved().value ? 'File saved.' : $state.isSavingFile().value ? 'Saving file...' : 'File not saved.'">
                            <Icon name="lucide:file-check" class="size-3" v-if="$state.isFileSaved().value"/>
                            <Icon name="lucide:file-clock" class="size-3 animate-pulse animate" v-else-if="$state.isSavingFile().value"/>
                            <Icon name="lucide:file-x" class="size-3 bg-error-500" v-else/>
                        </UTooltip>
                    </template>
                </div>
            </div>
        </div>
        <TiptapEditorContent :editor="editor" class="max-w-none w-full h-full" />
        <template v-if="props.showBottomBar">
            <div class="w-full fixed bottom-0 left-0 right-0 h-fit z-10">
                <div class="w-full flex items-center justify-start p-1 gap-1 select-none">
                    <div class="w-fit flex items-center justify-start rounded-lg backdrop-blur-md p-1 gap-1 select-none">
                        <UButton icon="lucide:bold" size="xs" :variant="boldToggled"
                                 :disabled="!editor?.can().chain().focus().toggleBold().run()"
                                 @click="editor?.chain().focus().toggleBold().run()"/>
                        <UButton icon="lucide:italic" size="xs" :variant="italicToggled"
                                 :disabled="!editor?.can().chain().focus().toggleItalic().run()"
                                 @click="editor?.chain().focus().toggleItalic().run()"/>
                        <UButton icon="lucide:strikethrough" size="xs" :variant="strikeToggled"
                                 :disabled="!editor?.can().chain().focus().toggleStrike().run()"
                                 @click="editor?.chain().focus().toggleStrike().run()"/>
                        <UButton icon="lucide:underline" size="xs" :variant="underlinedToggled"
                                 :disabled="!editor?.can().chain().focus().toggleUnderline().run()"
                                 @click="editor?.chain().focus().toggleUnderline().run()"/>
                        <UButton icon="lucide:code" size="xs" :variant="codeToggled"
                                 :disabled="!editor?.can().chain().focus().toggleCode().run()"
                                 @click="editor?.chain().focus().toggleCode().run()"/>
                        <USelect v-model="currentTextStyle" size="xs" :items="textStylesSelect"
                                 :disabled="!editor?.can().chain().focus().toggleHeading({level: 1}).run()"
                                 @update:model-value="setStyle" />
                    </div>
                </div>
            </div>
            <slot name="bottom-bar"/>
        </template>
    </div>
</template>

<style>
@reference "../assets/css/main.css";

.tiptap {
    @apply h-full min-h-max w-full max-w-none px-10 pt-16 pb-40 prose-sm prose prose-neutral dark:prose-invert;

    a {
        @apply cursor-pointer underline;
    }
}

div[contenteditable='true']:focus {
    @apply outline-none border-none h-full shadow-none;
}

.custom-drag-handle {
    &::after {
        @apply flex items-center justify-center w-4 h-5 content-['⠿'] font-bold cursor-grab rounded-md;
    }
}

.search-result {
    @apply bg-red-500 p-1 rounded-lg text-white;
}

.mention {
    @apply cursor-pointer p-1 rounded-md;
}

.tiptap p.is-editor-empty:first-child::before {
    @apply animate-pulse float-left h-0 pointer-events-none;
    content: attr(data-placeholder);
}

.table-of-contents {
    @apply flex flex-col text-sm gap-1 overflow-auto no-underline;

    .is-active a {
        @apply text-purple-500;
    }

    .is-scrolled-over a {
        @apply text-gray-500;
    }

    a {
        @apply text-black flex gap-1 no-underline;

        &::before {
            content: attr(data-item-index) '.';
        }
    }
}
</style>