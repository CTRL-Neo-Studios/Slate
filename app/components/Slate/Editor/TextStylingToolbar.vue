<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'

const props = defineProps<{
    editor: Editor | undefined
}>()

const $slateCommon = useSlateCommon()

const buttonVariant = (toggled: boolean | undefined) => {
    // console.log(toggled)
    return (toggled || false) ? 'solid' : 'ghost'
};

const $editor = computed(() => props?.editor)

const moreTools = useState<boolean>('moreToolsForToolbar', () => false)
const expandFormatting = useState<boolean>('expandTextFormattingToolbar', () => false)

const boldToggled = computed(() => buttonVariant($editor.value?.isActive('bold')))
const italicToggled = computed(() => buttonVariant($editor.value?.isActive('italic')))
const strikeToggled = computed(() => buttonVariant($editor.value?.isActive('strike')))
const underlinedToggled = computed(() => buttonVariant($editor.value?.isActive('underline')))
const codeToggled = computed(() => buttonVariant($editor.value?.isActive('code')))

const insertTableRows = ref(2), insertTableCols = ref(2), insertTableHeaderRow = ref(true)
const insertCalloutColor = ref('primary'), insertCalloutTitle = ref('Untitled'), insertCalloutIcon = ref('lucide:info')
const selectIconModalForCallout = $slateCommon.instantiateSelectIconModal((newIcon: string) => {
    insertCalloutIcon.value = newIcon
    insertAccordionIcon.value = newIcon
})
const insertCardVariant = ref('outline')
const insertAccordionIcon = ref('lucide:info'), insertAccordionTitle = ref('Untitled')
const insertColumnNumber = ref(2)

const colorsSelectOptions = themeVariableColors()
const variantsSelectOptions = themeVariableVariants()

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
</script>

<template>
    <div class="w-fit h-fit fixed bottom-0 left-0 z-10 print:hidden p-2 select-none">
        <div class="w-fit flex items-start justify-center flex-col gap-1 h-fit">
            <Transition class="transition-all duration-300 flex flex-col items-start justify-start" enter-from-class="opacity-0 -translate-x-10 h-0 overflow-hidden" leave-active-class="opacity-0 -translate-x-10 h-0 overflow-hidden">
                <div class="w-fit flex flex-col items-start justify-start rounded-lg backdrop-blur-md gap-1 select-none" v-if="!moreTools">
                    <UTooltip text="Bold" :kbds="['meta', 'B']">
                        <UButton icon="lucide:bold" size="xs" :variant="boldToggled"
                                 :disabled="!editor?.can().chain().focus().toggleBold().run()"
                                 @click="editor?.chain().focus().toggleBold().run()"/>
                    </UTooltip>
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
                    <UPopover>
                        <UButton icon="lucide:table" size="xs" variant="ghost"
                                 :disabled="!editor?.can().chain().focus().insertTable()"/>
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
                                <UButton @click="editor?.chain().focus().insertTable({ rows: insertTableRows, cols: insertTableCols, withHeaderRow: insertTableHeaderRow }).run()"
                                         size="xs" class="w-full justify-center items-center" label="Insert"/>
                            </div>
                        </template>
                    </UPopover>
                    <UTooltip text="More Actions..." :delay-duration="300">
                        <UButton icon="lucide:ellipsis" size="xs" variant="ghost"
                                 :disabled="!editor"
                                 @click="moreTools = true"/>
                    </UTooltip>
                </div>
                <div class="w-fit flex flex-col items-start justify-start rounded-lg backdrop-blur-md gap-1 select-none" v-else>
                    <UPopover>
                        <UButton icon="lucide:rectangle-ellipsis" size="xs" variant="ghost"
                                 :disabled="!editor"/>
                        <template #content>
                            <div class="flex flex-col items-end justify-center p-2 w-fit h-fit gap-2">
                                <div class="grid grid-cols-2 w-40 gap-2">
                                    <div class="text-xs flex items-center">Title</div>
                                    <UInput size="xs" v-model="insertCalloutTitle"/>
                                    <div class="text-xs flex items-center">Icon</div>
                                    <UButton size="xs" class="w-fit justify-self-end" :icon="insertCalloutIcon" @click="selectIconModalForCallout.open()"/>
                                    <div class="text-xs flex items-center">Color</div>
                                    <USelect size="xs" v-model="insertCalloutColor" :items="colorsSelectOptions"/>
                                </div>
                                <UButton @click="() => {
                                                    //@ts-ignore
                                                    editor?.chain().focus().setCallout({ icon: insertCalloutIcon, color: insertCalloutColor, title: insertCalloutTitle, variant: insertCalloutVariant }).run()
                                                }"
                                         size="xs" class="w-full justify-center items-center" label="Insert"/>
                            </div>
                        </template>
                    </UPopover>
                    <UPopover>
                        <UButton icon="lucide:list-collapse" size="xs" variant="ghost"
                                 :disabled="!editor"/>
                        <template #content>
                            <div class="flex flex-col items-end justify-center p-2 w-fit h-fit gap-2">
                                <div class="grid grid-cols-2 w-40 gap-2">
                                    <div class="text-xs flex items-center">Title</div>
                                    <UInput size="xs" v-model="insertAccordionTitle"/>
                                    <div class="text-xs flex items-center">Icon</div>
                                    <UButton size="xs" class="w-fit justify-self-end" :icon="insertAccordionIcon" @click="selectIconModalForCallout.open()"/>
                                </div>
                                <UButton @click="() => {
                                                    //@ts-ignore
                                                    editor?.chain().focus().setAccordion({ title: insertAccordionTitle, icon: insertAccordionIcon }).run()
                                                }"
                                         size="xs" class="w-full justify-center items-center" label="Insert"/>
                            </div>
                        </template>
                    </UPopover>
                    <UTooltip text="Back" :delay-duration="300">
                        <UButton icon="lucide:arrow-left" size="xs"
                                 variant="soft"
                                 :disabled="!editor"
                                 @click="moreTools = false"/>
                    </UTooltip>
                </div>
            </Transition>
            <USelect v-model="currentTextStyle" size="xs" :items="textStylesSelect"
                     :disabled="!editor?.can().chain().focus().toggleHeading({level: 1}).run()"
                     @update:model-value="setStyle" />
        </div>
    </div>
</template>

<style scoped>

</style>