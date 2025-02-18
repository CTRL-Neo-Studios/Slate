import { Highlight } from '@tiptap/extension-highlight'
import { Underline } from '@tiptap/extension-underline'
import type { Editor } from '@tiptap/vue-3'
import type { ShallowRef } from '@vue/reactivity'

export const useSlateEditor = (onUpdateCallback: any, ...extensions: any[]) => {
    return useEditor({
        content: "<p></p>",
        extensions: [TiptapStarterKit, TiptapLink, Highlight, Underline, ...extensions],
        onUpdate() {
            onUpdateCallback();
        }
    });
}