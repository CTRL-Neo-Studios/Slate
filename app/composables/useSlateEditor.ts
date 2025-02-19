import { Highlight } from '@tiptap/extension-highlight'
import { Underline } from '@tiptap/extension-underline'
import { CharacterCount } from '@tiptap/extension-character-count'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import { SearchAndReplace } from '@sereneinserenade/tiptap-search-and-replace'
import GlobalDragHandle from 'tiptap-extension-global-drag-handle'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import type { Editor } from '@tiptap/vue-3'
import type { ShallowRef } from '@vue/reactivity'

export const useSlateEditor = (onUpdateCallback: any, ...extensions: any[]) => {
    return useEditor({
        content: "<p></p>",
        extensions: [
            TiptapStarterKit,
            TiptapLink,
            Highlight,
            Underline,
            CharacterCount,
            Table,
            TableRow,
            TableHeader,
            TableCell,
            SearchAndReplace,
            GlobalDragHandle,
            // TaskList,
            // TaskItem.configure({
            //     HTMLAttributes: {
            //         class: 'task-item-prose',
            //     },
            // }),
            ...extensions
        ],
        onUpdate() {
            onUpdateCallback();
        }
    });
}