import { register } from '@tauri-apps/plugin-global-shortcut';
import { Editor } from '@tiptap/vue-3'

export const useSetupShortcuts = () => {
    const { saveNote } = useNoteSaver();
    const { importNote } = useNoteImporter();

    // Register Ctrl+S for saving
    const init = (editor: Ref<Editor | undefined>) => {
        // register('CommandOrControl+S', async () => {
        //     console.log('Save shortcut triggered')
        //     await saveNote(editor.value?.getHTML()) // Replace with actual content
        // })
        //
        // // Register Ctrl+O for opening
        // register('CommandOrControl+O', async () => {
        //     console.log('Open shortcut triggered')
        //     const data = await importNote()
        //     editor.value?.commands.setContent(data.content)
        // })
    }

    return {init}
};