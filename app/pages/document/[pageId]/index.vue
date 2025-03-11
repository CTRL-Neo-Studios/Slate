<script setup lang="ts">
import {
    SlateModalDocumentInformation, SlateModalNodesView,
    SlateSlideoverPagesTree,
} from '#components'

definePageMeta({
    layout: 'pages-directory'
})

defineShortcuts({
    meta_g: {
        usingInput: true,
        handler: () => {
            isOpenedPageTreeSlideover.value = !isOpenedPageTreeSlideover.value
            if(isOpenedPageTreeSlideover.value) {
                pagesTree()
            }else {
                slatePageTreeSliderover.close()
            }
        },
    },
    meta_shift_g: {
        usingInput: true,
        handler: () => {
            isOpenedNodesView.value = !isOpenedNodesView.value
            if(isOpenedNodesView.value) {
                nodesView()
            }else {
                slateNodesViewModal.close()
            }
        }
    }
})

onMounted(() => {
    $appMenu.init($editor)
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
const $m = useOverlay(), $t = useToast()

const slateDocInfoModal = $m.create(SlateModalDocumentInformation)
const slatePageTreeSliderover = $m.create(SlateSlideoverPagesTree)
const slateNodesViewModal = $m.create(SlateModalNodesView)
const isOpenedPageTreeSlideover = ref(false), isOpenedNodesView = ref(false)

const breadcrumbs = computed(() => {
    let arr = $slate.getCurrentNestedPageDirsPerformant($pageId).map((i: any) => {
        return {
            slot: 'page',
            label: i.name,
            icon: i.icon,
            to: `/document/${i.uuid}`,
        }
    })
    if (arr.length > 1){
        let concat = {
            slot: 'dropdown',
            icon: 'lucide:ellipsis',
            label: '',
            children: [
                ...arr.slice(0, arr.length-1)
            ]
        }
        return [
            {
                icon: '',
                slot: 'document',
                label: $slate.getFileName(),
            },
            concat,
            arr[arr.length-1],
        ]
    }

    return [
        {
            icon: '',
            slot: 'document',
            label: $slate.getFileName(),
        },
        ...arr,
    ]
})

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

const buttonVariant = (toggled: boolean | undefined) => {
    // console.log(toggled)
    return (toggled || false) ? 'subtle' : 'ghost'
};

const moreTools = ref(false)

const boldToggled = computed(() => buttonVariant($editor.value?.isActive('bold')))
const italicToggled = computed(() => buttonVariant($editor.value?.isActive('italic')))
const strikeToggled = computed(() => buttonVariant($editor.value?.isActive('strike')))
const underlinedToggled = computed(() => buttonVariant($editor.value?.isActive('underlined')))
const codeToggled = computed(() => buttonVariant($editor.value?.isActive('code')))

const insertTableRows = ref(2), insertTableCols = ref(2), insertTableHeaderRow = ref(true)
const insertCalloutColor = ref('primary'), insertCalloutTitle = ref('Untitled'), insertCalloutIcon = ref('lucide:info'), insertCalloutVariant = ref('solid')
const selectIconModalForCallout = $slateCommon.instantiateSelectIconModal((newIcon: string) => {
    insertCalloutIcon.value = newIcon
})

const calloutColorsSelect = calloutColors()
const calloutVariantsSelect = calloutVariants()
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
    return $editor.value?.isActive('heading', { level: 1 }) ? 'heading-1' :
        $editor.value?.isActive('heading', { level: 2 }) ? 'heading-2' :
            $editor.value?.isActive('heading', { level: 3 }) ? 'heading-3' :
                $editor.value?.isActive('heading', { level: 4 }) ? 'heading-4' :
                    $editor.value?.isActive('heading', { level: 5 }) ? 'heading-5' :
                        $editor.value?.isActive('heading', { level: 6 }) ? 'heading-6' :
                            $editor.value?.isActive('codeBlock') ? 'code' : 'paragraph'
})

function setStyle(value: string) {
    switch (value) {
        case "paragraph":
            $editor.value?.chain().focus().setParagraph().run();
            break;
        case "heading-1":
            $editor.value?.chain().focus().toggleHeading({ level: 1 }).run();
            break;
        case "heading-2":
            $editor.value?.chain().focus().toggleHeading({ level: 2 }).run();
            break;
        case "heading-3":
            $editor.value?.chain().focus().toggleHeading({ level: 3 }).run();
            break;
        case "heading-4":
            $editor.value?.chain().focus().toggleHeading({ level: 4 }).run();
            break;
        case "heading-5":
            $editor.value?.chain().focus().toggleHeading({ level: 5}).run();
            break;
        case "heading-6":
            $editor.value?.chain().focus().toggleHeading({ level: 6 }).run();
            break;
        case "code":
            $editor.value?.chain().focus().toggleCodeBlock().run();
            break;
    }
}

function documentInformation() {
    return `${$editor.value?.storage.characterCount.words()} Words, ${$editor.value?.storage.characterCount.characters()} Characters`
}

function pagesTree() {
    slatePageTreeSliderover.open({
        pages: $slate.getCurrentSlateDoc().value?.pages,
        currentPage: $pageId,
    })
}

function nodesView() {
    slateNodesViewModal.open({
        currentPage: $pageId,
    })
}

</script>

<template>
    <div>
        <div class="w-full flex justify-center items-start min-h-screen">
            <div class="h-full sm:w-xl md:w-2xl w-3xl lg:w-4xl xl:w-5xl">
                <div class="w-full fixed top-0 left-0 right-0 h-fit z-10">
                    <div class="flex items-center justify-center p-2 gap-2 select-none cursor-default" data-tauri-drag-region>
                        <div class="flex items-center justify-center p-1 px-2 gap-2 rounded-lg backdrop-blur-md z-20 w-fit" data-tauri-drag-region>
                            <!--Ignore The Error Here... fucking typescript-->
                            <UBreadcrumb :items="breadcrumbs" class="text-sm select-none gap-1" data-tauri-drag-region>
                                <template #document="{item}" data-tauri-drag-region>
                                    <div data-tauri-drag-region class="px-1">{{item.label}}</div>
                                </template>
                                <template #page="{item}" data-tauri-drag-region>
                                    <UDropdownMenu :items="[
                                        {
                                            label: 'Rename Page',
                                            onSelect () {
                                                $slateCommon.renamePage($pageId, 'Page')
                                            }
                                        },
                                        {
                                            label: 'Change Icon',
                                            onSelect () {
                                                $slateCommon.changeIcon($pageId)
                                            }
                                        }
                                    ]">
                                        <UButton data-tauri-drag-region class="px-1" :icon="item?.icon || 'lucide:file'" size="sm" :label="item?.label || 'Untitled Page'" variant="link" />
                                    </UDropdownMenu>
                                </template>
                                <template #dropdown="{item}" data-tauri-drag-region>
                                    <UDropdownMenu :items="(item as any).children || []">
                                        <UButton data-tauri-drag-region class="px-1" :icon="item.icon" size="sm" variant="link" />
                                    </UDropdownMenu>
                                </template>
                                <template #separator data-tauri-drag-region>
                                    <div class="text-(--ui-text-muted)" data-tauri-drag-region>/</div>
                                </template>
                            </UBreadcrumb>
                            <Icon data-tauri-drag-region name="lucide:file-warning" class="size-3" v-if="$slate.getFilePath().value == null || ''"/>
                            <template v-else>
                                <Icon data-tauri-drag-region name="lucide:file-clock" class="size-3 animate-pulse animate" v-if="$slate.isSavingFile().value"/>
                                <Icon data-tauri-drag-region name="lucide:file-check" class="size-3" v-else-if="$slate.isFileSaved().value"/>
                                <Icon data-tauri-drag-region name="lucide:file-x" class="size-3 bg-error-500" v-else/>
                            </template>
                        </div>
                    </div>
                </div>
                <TiptapEditorContent :editor="$editor" class="max-w-none w-full h-full" />
                <template v-if="showBottomBar">
                    <div class="w-full fixed bottom-0 left-0 right-0 h-fit z-10">
                        <div class="w-full flex items-center justify-start p-1 gap-1 select-none">
                            <Transition class="transition-all duration-200" enter-active-class="blur-sm opacity-0" leave-active-class="blur-sm opacity-0">
                                <div class="w-fit flex items-center justify-start rounded-lg backdrop-blur-md p-1 gap-1 select-none" v-if="!moreTools">
                                    <USelect v-model="currentTextStyle" size="xs" :items="textStylesSelect"
                                             :disabled="!$editor?.can().chain().focus().toggleHeading({level: 1}).run()"
                                             @update:model-value="setStyle" />
                                    <UTooltip text="Bold" :kbds="['meta', 'B']">
                                        <UButton icon="lucide:bold" size="xs" :variant="boldToggled"
                                                 :disabled="!$editor?.can().chain().focus().toggleBold().run()"
                                                 @click="$editor?.chain().focus().toggleBold().run()"/>
                                    </UTooltip>
                                    <UButton icon="lucide:italic" size="xs" :variant="italicToggled"
                                             :disabled="!$editor?.can().chain().focus().toggleItalic().run()"
                                             @click="$editor?.chain().focus().toggleItalic().run()"/>
                                    <UButton icon="lucide:strikethrough" size="xs" :variant="strikeToggled"
                                             :disabled="!$editor?.can().chain().focus().toggleStrike().run()"
                                             @click="$editor?.chain().focus().toggleStrike().run()"/>
                                    <UButton icon="lucide:underline" size="xs" :variant="underlinedToggled"
                                             :disabled="!$editor?.can().chain().focus().toggleUnderline().run()"
                                             @click="$editor?.chain().focus().toggleUnderline().run()"/>
                                    <UButton icon="lucide:code" size="xs" :variant="codeToggled"
                                             :disabled="!$editor?.can().chain().focus().toggleCode().run()"
                                             @click="$editor?.chain().focus().toggleCode().run()"/>
                                    <UPopover>
                                        <UButton icon="lucide:table" size="xs" variant="ghost"
                                                 :disabled="!$editor?.can().chain().focus().insertTable()"/>
                                        <template #content>
                                            <div class="flex flex-col items-end justify-center p-2 w-fit h-fit gap-2">
                                                <div class="grid grid-cols-2 w-40 gap-2">
                                                    <div class="text-xs flex items-center">Rows</div>
                                                    <UInputNumber size="xs" v-model="insertTableRows" :min="1"/>
                                                    <div class="text-xs flex items-center">Columns</div>
                                                    <UInputNumber size="xs" v-model="insertTableCols" :min="1"/>
                                                    <div class="text-xs flex items-center">Header Row</div>
                                                    <USwitch size="xs" v-model="insertTableHeaderRow"/>
                                                </div>
                                                <UButton @click="$editor?.chain().focus().insertTable({ rows: insertTableRows, cols: insertTableCols, withHeaderRow: insertTableHeaderRow }).run()"
                                                         size="xs" class="w-full justify-center items-center" label="Insert"/>
                                            </div>
                                        </template>
                                    </UPopover>
                                    <UTooltip text="More Actions..." :delay-duration="300">
                                        <UButton icon="lucide:ellipsis" size="xs" variant="ghost"
                                                 :disabled="!$editor"
                                                 @click="moreTools = true"/>
                                    </UTooltip>
                                </div>
                                <div class="w-fit flex items-center justify-start rounded-lg backdrop-blur-md p-1 gap-1 select-none" v-else>
                                    <UTooltip text="Back" :delay-duration="300">
                                        <UButton icon="lucide:chevron-left" size="xs"
                                                 :disabled="!$editor"
                                                 @click="moreTools = false"/>
                                    </UTooltip>
                                    <UPopover>
                                        <UButton icon="lucide:rectangle-ellipsis" size="xs" variant="ghost"
                                                 :disabled="!$editor"/>
                                        <template #content>
                                            <div class="flex flex-col items-end justify-center p-2 w-fit h-fit gap-2">
                                                <div class="grid grid-cols-2 w-40 gap-2">
                                                    <div class="text-xs flex items-center">Title</div>
                                                    <UInput size="xs" v-model="insertCalloutTitle"/>
                                                    <div class="text-xs flex items-center">Icon</div>
                                                    <UButton size="xs" class="w-fit justify-self-end" :icon="insertCalloutIcon" @click="selectIconModalForCallout.open()"/>
                                                    <div class="text-xs flex items-center">Color</div>
                                                    <USelect size="xs" v-model="insertCalloutColor" :items="calloutColorsSelect"/>
                                                    <div class="text-xs flex items-center">Variant</div>
                                                    <USelect size="xs" v-model="insertCalloutVariant" :items="calloutVariantsSelect"/>
                                                </div>
                                                <UButton @click="() => {
                                                    //@ts-ignore
                                                    $editor?.chain().focus().setCallout({ icon: insertCalloutIcon, color: insertCalloutColor, title: insertCalloutTitle, variant: insertCalloutVariant }).run()
                                                }"
                                                         size="xs" class="w-full justify-center items-center" label="Insert"/>
                                            </div>
                                        </template>
                                    </UPopover>
                                </div>
                            </Transition>

                            <div class="flex-grow -z-20"/>
                            <div class="w-fit flex items-center justify-end rounded-lg backdrop-blur-md p-1 gap-1 select-none">
                                <UTooltip :text="documentInformation()" :delay-duration="200">
                                    <UButton icon="lucide:info" size="xs" variant="ghost" @click="() => {
                                        slateDocInfoModal.open({
                                            wordCount: $editor?.storage.characterCount.words(),
                                            charCount: $editor?.storage.characterCount.characters()
                                        })
                                    }"/>
                                </UTooltip>
                                <UTooltip :kbds="['meta', 'G']" text="Page Trees">
                                    <UButton icon="lucide:list-tree" size="xs" variant="ghost" @click="() => {
                                        pagesTree()
                                    }"/>
                                </UTooltip>
                                <UTooltip :kbds="['meta', 'shift', 'G']" text="Nodes View">
                                    <UButton icon="lucide:network" size="xs" variant="ghost" @click="() => {
                                        nodesView()
                                    }"/>
                                </UTooltip>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<style>
@reference "~/assets/css/main.css";

.tiptap {
    @apply h-full min-h-max w-full max-w-none px-10 pt-16 pb-40 prose-sm prose prose-zinc dark:prose-invert;

    a {
        @apply cursor-pointer underline;
    }
}

div[contenteditable='true']:focus {
    @apply outline-none border-none h-full shadow-none;
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

.tiptap {
    td {
        @apply active:first:border-r active:last:border-l border-x-neutral-700
    }
    th {
        @apply active:first:border-r active:last:border-l border-x-neutral-700
    }
}

.drag-handle {
    position: fixed;
    opacity: 1;
    transition: opacity ease-in 0.2s;
    border-radius: 0.25rem;

    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' style='fill: rgba(0, 0, 0, 0.5)'%3E%3Cpath d='M3,2 C2.44771525,2 2,1.55228475 2,1 C2,0.44771525 2.44771525,0 3,0 C3.55228475,0 4,0.44771525 4,1 C4,1.55228475 3.55228475,2 3,2 Z M3,6 C2.44771525,6 2,5.55228475 2,5 C2,4.44771525 2.44771525,4 3,4 C3.55228475,4 4,4.44771525 4,5 C4,5.55228475 3.55228475,6 3,6 Z M3,10 C2.44771525,10 2,9.55228475 2,9 C2,8.44771525 2.44771525,8 3,8 C3.55228475,8 4,8.44771525 4,9 C4,9.55228475 3.55228475,10 3,10 Z M7,2 C6.44771525,2 6,1.55228475 6,1 C6,0.44771525 6.44771525,0 7,0 C7.55228475,0 8,0.44771525 8,1 C8,1.55228475 7.55228475,2 7,2 Z M7,6 C6.44771525,6 6,5.55228475 6,5 C6,4.44771525 6.44771525,4 7,4 C7.55228475,4 8,4.44771525 8,5 C8,5.55228475 7.55228475,6 7,6 Z M7,10 C6.44771525,10 6,9.55228475 6,9 C6,8.44771525 6.44771525,8 7,8 C7.55228475,8 8,8.44771525 8,9 C8,9.55228475 7.55228475,10 7,10 Z'%3E%3C/path%3E%3C/svg%3E");
    background-size: calc(0.5em + 0.375rem) calc(0.5em + 0.375rem);
    background-repeat: no-repeat;
    background-position: center;
    width: 1.2rem;
    height: 1.5rem;
    z-index: 50;
    cursor: grab;

    &:hover {
        transition: background-color 0.2s;
    }

    &:active {
        transition: background-color 0.2s;
        cursor: grabbing;
    }

    &.hide {
        opacity: 0;
        pointer-events: none;
    }

    @media screen and (max-width: 600px) {
        display: none;
        pointer-events: none;
    }
}

.dark .drag-handle {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' style='fill: rgba(255, 255, 255, 0.5)'%3E%3Cpath d='M3,2 C2.44771525,2 2,1.55228475 2,1 C2,0.44771525 2.44771525,0 3,0 C3.55228475,0 4,0.44771525 4,1 C4,1.55228475 3.55228475,2 3,2 Z M3,6 C2.44771525,6 2,5.55228475 2,5 C2,4.44771525 2.44771525,4 3,4 C3.55228475,4 4,4.44771525 4,5 C4,5.55228475 3.55228475,6 3,6 Z M3,10 C2.44771525,10 2,9.55228475 2,9 C2,8.44771525 2.44771525,8 3,8 C3.55228475,8 4,8.44771525 4,9 C4,9.55228475 3.55228475,10 3,10 Z M7,2 C6.44771525,2 6,1.55228475 6,1 C6,0.44771525 6.44771525,0 7,0 C7.55228475,0 8,0.44771525 8,1 C8,1.55228475 7.55228475,2 7,2 Z M7,6 C6.44771525,6 6,5.55228475 6,5 C6,4.44771525 6.44771525,4 7,4 C7.55228475,4 8,4.44771525 8,5 C8,5.55228475 7.55228475,6 7,6 Z M7,10 C6.44771525,10 6,9.55228475 6,9 C6,8.44771525 6.44771525,8 7,8 C7.55228475,8 8,8.44771525 8,9 C8,9.55228475 7.55228475,10 7,10 Z'%3E%3C/path%3E%3C/svg%3E");
}

/*
.task-item-prose {
    @apply prose;
}

li[data-type="taskList"] {
    @apply flex gap-2 items-start list-none pl-0;
}

li[data-type="taskList"] label {
    @apply flex items-center gap-2 cursor-pointer;
}

li[data-type="taskList"] input[type="checkbox"] {
    @apply mt-1 h-4 w-4 cursor-pointer rounded border-gray-300;
}

ul[data-type="taskList"] {
    @apply list-none pl-0;
}

li[data-type="taskList"] div {
    @apply flex-1;
}
*/

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
