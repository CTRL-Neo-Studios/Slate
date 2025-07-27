import { Underline } from '@tiptap/extension-underline'
import { CharacterCount } from '@tiptap/extension-character-count'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import { SearchAndReplace } from '@sereneinserenade/tiptap-search-and-replace'
import { Mathematics } from '@tiptap/extension-mathematics'
import AutoJoiner from 'tiptap-extension-auto-joiner'
import { Document } from '@tiptap/extension-document'
import { Typography } from '@tiptap/extension-typography'
import { StarterKit } from '@tiptap/starter-kit'
import CalloutNode from '~/components/Slate/Editor/Prose/CalloutNode'
import WikiLinkNode from '~/components/Slate/Editor/Prose/WikiLinkNode'
import WikiLinkSuggestion from '~/components/Slate/Editor/Prose/WikiLinkSuggestion'
import CardNode from '~/components/Slate/Editor/Prose/CardNode'
import AccordionNode from '~/components/Slate/Editor/Prose/AccordionNode'
import { UniqueID } from '@tiptap/extension-unique-id'
import { Placeholder } from '@tiptap/extension-placeholder'
import { DragHandle } from '@tiptap/extension-drag-handle-vue-3'
import { NodeRange } from '@tiptap/extension-node-range'
import Highlight from '~/components/Slate/Editor/Prose/Highlight'
import CodeBlockShiki from 'tiptap-extension-code-block-shiki'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'

export const useSlateEditor = (initialContent: string, editable: boolean, onUpdateCallback: any = null, ...extensions: any[]) => {

    const suggestionElement = ref<HTMLElement | null>(null)
    const CustomDocument = Document.extend({
        content: 'heading block*',
    })

    let suggestionApp: any = null

    return useEditor({
        content: initialContent,
        editable,
        extensions: [
            StarterKit.configure({
                document: false,
                codeBlock: false,
            }),
            TiptapLink,
            Highlight,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Underline,
            CharacterCount,
            Table,
            TableRow,
            TableHeader,
            TableCell,
            Typography,
            SearchAndReplace.configure({
                searchResultClass: "search-result",
                disableRegex: false,
            }),
            NodeRange.configure({
                // allow to select only on depth 0
                // depth: 0,
                key: null,
            }),
            AutoJoiner,
            Mathematics,
            CalloutNode,
            // CardNode,
            AccordionNode,
            WikiLinkNode,
            WikiLinkSuggestion,
            CustomDocument,
            UniqueID,
            // Container,
            Placeholder.configure({
                placeholder: ({ node }) => {
                    if (node.type.name === 'heading') {
                        return ''
                    } else if (node.type.name === 'paragraph') {
                        return 'Start typing or type \"/\" for more commands.'
                    }

                    return ''
                },
            }),
            CodeBlockShiki.configure({
                defaultTheme: 'tokyo-night'
            }),
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