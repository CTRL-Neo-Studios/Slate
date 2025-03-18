import { Highlight } from '@tiptap/extension-highlight'
import { Underline } from '@tiptap/extension-underline'
import { CharacterCount } from '@tiptap/extension-character-count'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import { SearchAndReplace } from '@sereneinserenade/tiptap-search-and-replace'
import { Mathematics } from '@tiptap-pro/extension-mathematics'
import GlobalDragHandle from 'tiptap-extension-global-drag-handle'
import AutoJoiner from 'tiptap-extension-auto-joiner'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import type { Editor } from '@tiptap/vue-3'
import type { ShallowRef } from '@vue/reactivity'
import { Typography } from '@tiptap/extension-typography'
import { StarterKit } from '@tiptap/starter-kit'
import CalloutNode from '~/components/Slate/Editor/Prose/CalloutNode'
import WikiLinkNode from '~/components/Slate/Editor/Prose/WikiLinkNode'
import WikiLinkSuggestion from '~/components/Slate/Editor/Prose/WikiLinkSuggestion'
import CardNode from '~/components/Slate/Editor/Prose/CardNode'
import AccordionNode from '~/components/Slate/Editor/Prose/AccordionNode'

export const useSlateEditor = (initialContent: string, editable: boolean, onUpdateCallback: any = null, ...extensions: any[]) => {

    const suggestionElement = ref<HTMLElement | null>(null)
    let suggestionApp: any = null

    return useEditor({
        content: initialContent,
        editable,
        extensions: [
            StarterKit,
            TiptapLink,
            Highlight,
            Underline,
            CharacterCount,
            Table,
            TableRow,
            TableHeader,
            TableCell,
            Typography,
            SearchAndReplace,
            GlobalDragHandle,
            AutoJoiner,
            Mathematics,
            CalloutNode,
            CardNode,
            AccordionNode,
            WikiLinkNode,
            WikiLinkSuggestion,
            // TaskList,
            // TaskItem.configure({
            //     HTMLAttributes: {
            //         class: 'task-item-prose',
            //     },
            // }),
            ...extensions
        ],
        onUpdate() {
            if (onUpdateCallback != null)
                onUpdateCallback();
        }
    });
}