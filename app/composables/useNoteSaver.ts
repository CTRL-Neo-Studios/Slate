import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile, writeFile, create } from '@tauri-apps/plugin-fs';
import type { Editor } from '@tiptap/vue-3'
import { SlateModalWarning } from '#components'
import { exit, relaunch } from '@tauri-apps/plugin-process';
import type { SlateDocument } from '~/slate.types'

export const useNoteSaver = () => {
    const $slate = useSlateFile();
    const $t = useToast();
    const $m = useOverlay()

    let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;

    const saveNote = async (notifyOutput: boolean = false) => {
        try {
            const jsonString = JSON.stringify(unref($slate.getCurrentSlateDoc()), null, 2);

            let targetPath = unref($slate.getFilePath());

            // If the file is not saved, show the save dialog
            if ((!unref($slate.isFileSaved()) && targetPath == null) || !targetPath?.endsWith(".sdf")) {
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
                $slate.setFilePath(targetPath);
            }

            // Save the file
            if (targetPath) {
                if(autoSaveTimeout)
                    clearTimeout(autoSaveTimeout)

                let encoder = new TextEncoder()
                let data = encoder.encode(jsonString)

                await writeFile(targetPath, data);
                if (notifyOutput)
                    $t.add({
                        title: 'Note Saved.',
                        color: 'success',
                    });
                $slate.setSavedStatus(true)
                console.log('Note saved successfully:', targetPath);
            }
        } catch (error) {
            $slate.setSavedStatus(false)
            $slate.setSavingFile(false)
            $t.add({
                title: 'Saving Note',
                description: `Error occurred while saving note: ${error}`,
                color: 'error',
                icon: 'lucide:circle-x'
            });
        }
    };

    const clearCurrentAutoSave = () => {
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
        }
    }

    const autoSave = () => {
        // Clear the previous timeout if it exists
        clearCurrentAutoSave()

        // Set a new timeout for auto-saving
        autoSaveTimeout = setTimeout(async () => {
            console.log('Auto-saving note...');
            await saveNote(); // Call the saveNote function
        }, 5000); // 5 seconds delay
    };

    const saveBeforeQuit = () => {
        if (!$slate.isFileSaved().value || !unref($slate.getFilePath())) {
            $m.create(SlateModalWarning, {
                props: {
                    title: 'Quitting Slate',
                    description: 'Your current note is unsaved! Are you sure you want to quit right now without saving?',
                    optCancelLabel: 'Don\'t Quit',
                    optConfirmLabel: 'Quit Without Saving',
                    async onConfirm() {
                        await exit(0)
                    },
                },
            }).open()
        } else {
            $m.create(SlateModalWarning, {
                props: {
                    title: 'Quitting Slate',
                    description: 'Are you sure you want to quit?',
                    async onConfirm() {
                        await exit(0)
                    },
                },
            }).open()
        }
    }

    return { saveNote, autoSave, saveBeforeQuit, clearCurrentAutoSave };
};