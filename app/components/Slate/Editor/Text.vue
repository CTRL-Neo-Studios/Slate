<script setup lang="ts">
// import { useVueToPrint } from 'vue-to-print'

const editableElement = ref()
// const { handlePrint } = useVueToPrint({
//     content: editableElement
// });
defineShortcuts({
    meta_p: {
        usingInput: true,
        handler: async () => {
            // await useNoteExporter().printPDF($editor, $slate.getCurrentSlatePage($pageId)?.name)
            // window.print()
            // console.log('pdf')
            // await useNoteExporter().exportToPDF(editableElement, $slate.getCurrentSlatePage($pageId)?.name)
            await useNoteExporter().printPDF(editableElement)
            // try {
            //     await exportToPDF('slate.pdf', editableElement.value)
            // } catch (e) {
            //     console.log(e)
            // }
        }
    },
    backspace: {
        handler: () => {

        }
    }
})

onBeforeUnmount(() => {
    unref($editor)?.destroy();
});

// TODO: Change this to Slate Settings later
const showBottomBar = ref(true)

const $route = useRoute()
const $appMenu = useAppMenu()
const $save = useNoteSaver()
const $slate = useSlateFile()
const $slateCommon = useSlateCommon()

const $pageId = computed(() => $route.params.pageId as string || '')

watch($pageId, (newId, oldId) => {
    $slate.setSlatePageContent(oldId, $editor.value?.getHTML() || '<p></p>')
    $save.saveNote()
    $editor.value?.commands.setContent($slate.getCurrentSlatePage(newId)?.content || '')
})

const $editor = useSlateEditor($slate.getCurrentSlatePage($pageId)?.content || '', true, () => {
    $slate.setSlatePageContent($pageId, $editor.value?.getHTML() || '<p></p>')
    $slate.setSavedStatus(false);
    $slate.setSavingFile(true);
    // This callback is called once the content inside the editor is updated
    if ($slate.getFilePath().value != null) {
        $save.autoSave()
    }
})

</script>

<template>
    <div class="w-full flex justify-center items-start min-h-screen">
        <div class="h-full sm:w-xl md:w-2xl w-3xl lg:w-4xl xl:w-5xl" ref="editableElement">
            <SlateEditorDragHandle :editor="$editor" v-if="$editor"/>
            <TiptapEditorContent :editor="$editor" v-if="$editor" class="max-w-none w-full h-full"/>
            <template v-if="showBottomBar">
                <SlateEditorTextStylingToolbar :editor="$editor" v-if="$editor"/>
                <SlateEditorViewsToolbar :editor="$editor" :pageId="$pageId" v-if="$editor"/>
            </template>
            <SlateEditorSearchReplaceTool :editor="$editor"/>
        </div>
    </div>
</template>

<style>
@reference "~/assets/css/main.css";

.tiptap {
    @apply h-full min-h-max w-full max-w-none px-10 pt-16 pb-40 custom-prose;

    a {
        @apply cursor-pointer underline;
    }
}

div[contenteditable='true']:focus {
    @apply outline-none border-none h-full shadow-none;
}

.mention {
    @apply cursor-pointer p-1 rounded-md;
}

.tiptap p.is-editor-empty:first-child::before {
    @apply animate-pulse float-left h-0 pointer-events-none;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
}

.tiptap {

    strong {
        @apply font-bold
    }

    mark {
        @apply bg-(--ui-bg-inverted) text-(--ui-bg) rounded-xs px-0.5
    }

}

.ProseMirror .column-block {
    width: 100%;
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    gap: 24px;
    padding: 8px 0;
}

.ProseMirror .column {
    overflow: hidden;
    padding: 8px;
    margin: -8px;
}

.ProseMirror-focused .column {
    border: 1px gray dashed;
    border-radius: 8px;
}

::selection {
    background-color: #70CFF850;
}

.ProseMirror-noderangeselection {
    *::selection {
        background: transparent;
    }

    * {
        caret-color: transparent;
    }
}

.ProseMirror-selectednode,
.ProseMirror-selectednoderange {
    position: relative;

    &::before {
        position: absolute;
        pointer-events: none;
        z-index: -1;
        content: '';
        top: -0.25rem;
        left: -0.25rem;
        right: -0.25rem;
        bottom: -0.25rem;
        background-color: #70CFF850;
        border-radius: 0.2rem;
    }
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
