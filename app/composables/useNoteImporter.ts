import { open } from '@tauri-apps/plugin-dialog';
import { readTextFile } from '@tauri-apps/plugin-fs';
import type { Editor } from '@tiptap/vue-3'
import { SlateModalWarning } from '#components'

export const useNoteImporter = () => {
    const { setFilePath, setSavedStatus } = useFileState();
    const $state = useFileState()
    const $t = useToast()
    const $m = useModal()

    const importNote = async (editor: Ref<Editor | undefined>) => {
        if ($state.getFilePath().value != null || !$state.isFileSaved().value){
            $m.open(SlateModalWarning, {
                title: 'Importing Note',
                description: 'This will override your currently unsaved note. Are you sure you want to continue?',
                async onConfirm() {
                    try {
                        const selectedFile = await open({
                            filters: [{
                                name: 'Slate Document Format',
                                extensions: ['sdf'],
                            }],
                        });

                        if (selectedFile) {
                            const fileContent = await readTextFile(selectedFile);
                            const noteData = JSON.parse(fileContent);

                            // Update the file state
                            setFilePath(selectedFile);
                            setSavedStatus(true);

                            editor.value?.commands.setContent(noteData.content)

                            $t.add({
                                title: `Opened Note ${selectedFile}`,
                                // description: `${fileContent}`,
                                color: 'success'
                            });
                        }
                    } catch (error) {
                        $t.add({
                            title: `Error`,
                            description: `Error occurred while opening note: ${error}`,
                            color: 'error'
                        });
                        console.error('Error importing note:', error);
                    } finally {
                        await $m.close()
                    }
                }
            })
        }
    };

    return { importNote };
};