<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'

const props = defineProps<{
    editor: Editor | undefined
}>()

const enabled = ref(false)
const searchFor = ref<string>('')
const replaceWith = ref<string>('')
const caseSensitive = ref<boolean>(false);
const searchResults = computed(() => props.editor?.storage.searchAndReplace.results)
const searchIndex = computed(() => props.editor?.storage.searchAndReplace.resultIndex)

const controlIndex = ref<number>(0)

defineShortcuts({
    meta_f: {
        usingInput: true,
        handler() {
            enabled.value = !enabled.value
            setTool(enabled.value)
        }
    },
    escape: {
        usingInput: true,
        handler() {
            if(enabled.value) {
                enabled.value = !enabled.value
                setTool(enabled.value)
            }
        }
    },
    // Add these new shortcuts
    arrowdown: {
        usingInput: false,
        handler: jumpToNextResult
    },
    arrowup: {
        usingInput: false,
        handler: jumpToPreviousResult
    }
})

function updateSearchReplace() {
    if (!props.editor) return;
    props.editor.commands.resetIndex()

    props.editor.commands.setCaseSensitive(unref(caseSensitive))

    controlIndex.value = 0
    props.editor.commands.setSearchTerm('');
    props.editor.commands.setSearchTerm(searchFor.value);
    props.editor.commands.setReplaceTerm(replaceWith.value);
}

function setTool(value: boolean) {
    if (!props.editor) return;
    props.editor.commands.setSearchTerm('');

    if (value) {
        props.editor.commands.setSearchTerm(searchFor.value);
    }

    props.editor.commands.setCaseSensitive(unref(caseSensitive))
}

function goToSelection(index: number) {
    if (!props.editor) return;
    const position: Range = unref(searchResults)[index];

    if (!position) return;

    controlIndex.value = index
    //@ts-ignore
    props.editor.commands.setTextSelection(position);

    const { node } = props.editor.view.domAtPos(
        props.editor.state.selection.anchor
    );
    node instanceof HTMLElement &&
    node.scrollIntoView({ behavior: "smooth", block: "center" });
}

function jumpToNextResult() {
    console.log(unref(searchResults))
    if (!props.editor || !searchResults.value) return;

    const currentIndex = controlIndex.value;
    const results = searchResults.value;

    if (!results || results.length === 0) return;

    // Calculate next index (wrapping around if needed)
    const nextIndex = (currentIndex + 1) % results.length;
    console.log(nextIndex)

    // Scroll to the result
    goToSelection(nextIndex);
}

function jumpToPreviousResult() {
    console.log(unref(searchResults))
    if (!props.editor || !searchResults.value) return;

    const currentIndex = controlIndex.value;
    const results = searchResults.value;

    if (!results || results.length === 0) return;

    // Calculate previous index (wrapping around if needed)
    const prevIndex = (currentIndex - 1 + results.length) % results.length;
    console.log(prevIndex)

    // Scroll to the result
    goToSelection(prevIndex);
}

function replaceKeyword() {
    props.editor?.commands.setReplaceTerm(replaceWith.value);
    props.editor?.commands.replace()
}

function replaceAllKeywords() {
    props.editor?.commands.setReplaceTerm(replaceWith.value);
    props.editor?.commands.replaceAll()
}
</script>

<template>
    <Transition class="transition-all duration-300 opacity-100" enter-from-class="opacity-0 translate-y-20" leave-active-class="opacity-0 transform translate-y-20">
        <div v-if="!enabled"/>
        <div class="w-fit h-fit bottom-2 fixed left-1/2 transform -translate-x-1/2" v-else>
            <div class="flex items-center p-2 justify-center rounded-lg backdrop-blur-sm gap-2 z-20 w-fit border border-(--ui-bg-muted) bg-(--ui-bg)/75 hover:bg-(--ui-bg) dark:shadow-flexoki-base-900 hover:shadow-lg duration-200 transition-all">
                <UFormField label="Search for" size="xs">
                    <UInput
                        v-model="searchFor"
                        placeholder="Keyword"
                        icon="lucide:search"
                        @update:model-value="payload => {
                            updateSearchReplace()
                        }"
                    />
                </UFormField>
                <UFormField label="Replace with" size="xs">
                    <UInput
                        v-model="replaceWith"
                        placeholder="keyword"
                        icon="lucide:pencil" />
                </UFormField>
                <UFormField label="Case Sensitive" size="xs">
                    <USwitch
                        v-model="caseSensitive"
                        @update:model-value="payload => {
                            updateSearchReplace()
                        }" />
                </UFormField>
                <UButton icon="lucide:arrow-left" size="xs" variant="ghost" @click="jumpToPreviousResult"/>
                <div class="text-sm text-(--ui-text)">{{searchResults.length !== 0 ? controlIndex + 1 : 0}}/{{searchResults.length}}</div>
                <UButton icon="lucide:arrow-right" size="xs" variant="ghost" @click="jumpToNextResult"/>
                <div class="flex flex-col items-center justify-center gap-1">
                    <UButton label="Replace" @click="replaceKeyword" size="xs" class="w-full justify-center"/>
                    <UButton label="Replace All" @click="replaceAllKeywords" variant="outline" size="xs" class="w-full justify-center"/>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style>
@reference "~/assets/css/main.css";

.search-result {
    @apply bg-flexoki-red-400 text-(--ui-bg)
}
</style>