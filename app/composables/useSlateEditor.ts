import { Highlight } from '@tiptap/extension-highlight'
import { Underline } from '@tiptap/extension-underline'
import { CharacterCount } from '@tiptap/extension-character-count'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import { SearchAndReplace } from '@sereneinserenade/tiptap-search-and-replace'
import GlobalDragHandle from 'tiptap-extension-global-drag-handle'
import AutoJoiner from 'tiptap-extension-auto-joiner'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import type { Editor } from '@tiptap/vue-3'
import type { ShallowRef } from '@vue/reactivity'
import { Typography } from '@tiptap/extension-typography'
import { StarterKit } from '@tiptap/starter-kit'

export const useSlateEditor = (initialContent: string, editable: boolean, onUpdateCallback: any, ...extensions: any[]) => {
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