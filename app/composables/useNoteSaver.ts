import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import type { Editor } from '@tiptap/vue-3'
import { SlateModalWarning } from '#components'
import { exit, relaunch } from '@tauri-apps/plugin-process';

export const useNoteSaver = () => {
    const { getFilePath, setSavedStatus, isFileSaved, setFilePath, resetFileState } = useFileState();
    const $t = useToast();
    const $m = useModal()

    let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;

    const saveNote = async (editor: Ref<Editor | undefined>, notifyOutput: boolean = false) => {
        try {
            let metaData = {}, embeddedImages: any[] = [], persistentData = {}, textType = "html"
            // Construct the custom file format (JSON)
            const noteData = {
                metaData,
                content: editor.value?.getHTML(),
                embeddedImages,
                persistentData,
                textType
            };
            const jsonString = JSON.stringify(noteData, null, 2);

            let targetPath = unref(getFilePath());

            // If the file is not saved, show the save dialog
            if (!unref(isFileSaved()) && getFilePath().value == null) {
                targetPath = await save({
                    filters: [{
                        name: 'Slate Document Format',
                        extensions: ['sdf'],
                    }],
                });

                if (!targetPath) {
                    // User canceled the save dialog
                    return;
                }

                // Update the file state
                setFilePath(targetPath);
            }

            // Save the file
            if (targetPath) {
                if(autoSaveTimeout)
                    clearTimeout(autoSaveTimeout)

                await writeTextFile(targetPath, jsonString);
                if (notifyOutput)
                    $t.add({
                        title: 'Note Saved.',
                        color: 'success',
                    });
                setSavedStatus(true)
                console.log('Note saved successfully:', targetPath);
            }
        } catch (error) {
            $t.add({
                title: 'Saving Note',
                description: `Error occurred while saving note: ${error}`,
                color: 'error',
            });
        }
    };

    const autoSave = (editor: Ref<Editor | undefined>) => {
        // Clear the previous timeout if it exists
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
        }

        // Set a new timeout for auto-saving
        autoSaveTimeout = setTimeout(async () => {
            console.log('Auto-saving note...');
            await saveNote(editor); // Call the saveNote function
        }, 5000); // 5 seconds delay
    };

    const saveBeforeQuit = () => {
        if (!isFileSaved().value) {
            $m.open(SlateModalWarning, {
                title: 'Quitting Slate',
                description: 'Your current note is unsaved! Are you sure you want to quit right now without saving?',
                optCancelLabel: 'Don\'t Quit',
                optConfirmLabel: 'Quit Without Saving',
                async onConfirm() {
                    await exit(0)
                }
            })
        } else {
            $m.open(SlateModalWarning, {
                title: 'Quitting Slate',
                description: 'Are you sure you want to quit?',
                async onConfirm() {
                    await exit(0)
                }
            })
        }
    }

    return { saveNote, autoSave, saveBeforeQuit, resetFileState };
};