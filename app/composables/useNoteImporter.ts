import { open } from '@tauri-apps/plugin-dialog';
import { readTextFile, readFile } from '@tauri-apps/plugin-fs';
import type { Editor } from '@tiptap/vue-3'
import { SlateModalWarning } from '#components'
import {marked} from 'marked'
import type { SlateDocument } from '~/slate.types'

export const useNoteImporter = () => {
    const $slate = useSlateFile()
    const $t = useToast()
    const $m = useModal()

    const confirmImport = async () => {
        const fallbackFilePath = unref($slate.getFilePath())

        try {
            const selectedFile = await open({
                filters: [{
                    name: 'Slate Document Format',
                    extensions: ['sdf', 'md', 'txt'],
                }],
            });

            await importFile(selectedFile)

            if (selectedFile)
                $t.add({
                    title: `Opened Note ${$slate.getFileName()}`,
                    description: `Opened from directory ${selectedFile}`,
                    color: 'success'
                });
        } catch (error) {
            $t.add({
                title: `Error`,
                description: `Error occurred while opening note: ${error}`,
                color: 'error'
            });
            if (fallbackFilePath) {
                await importFile(fallbackFilePath)
            } else {
                $slate.createSlateDocument()
            }
            console.error('Error importing note:', error);
        } finally {
            await $m.close()
        }
    }

    const importNote = async () => {
        if ($slate.getFilePath().value != null && !$slate.isFileSaved().value){
            $m.open(SlateModalWarning, {
                title: 'Importing Note',
                description: 'This will override your currently unsaved note. Are you sure you want to continue?',
                async onConfirm() {
                    await confirmImport()
                }
            })
        } else {
            await confirmImport()
        }
    };

    const importFile = async (selectedFile: string | null) => {
        if (!selectedFile) {
            await $m.close()
            return
        }

        if (selectedFile.endsWith('sdf')) {
            await readSDF(selectedFile)
        } else if (selectedFile.endsWith('md')) {
            await readMarkdown(selectedFile)
        } else if (selectedFile.endsWith('txt')) {
            await readTXT(selectedFile)
        } else {
            $t.add({
                title: 'Unable to Import Note',
                description: 'Unsupported extension for editing in slate.',
                icon: 'lucide:circle-x',
                color: 'error'
            })
            await $m.close()
            return
        }
    }

    const readSDF = async (path: string, routePage: boolean = true) => {
        const fileRawContent = await readFile(path);
        let decoder = new TextDecoder()
        const fileContent = decoder.decode(fileRawContent)
        const rawData = JSON.parse(fileContent);
        const noteData: SlateDocument = {
            metaData: rawData.metaData,
            pages: rawData.pages
        }

        console.log(noteData as SlateDocument)

        // Update the file state
        $slate.setFilePath(path);
        $slate.setSavedStatus(true);

        $slate.setSlateDocument(noteData as SlateDocument)
        if (routePage)
            await navigateTo(`/document/${noteData.pages[0]?.uuid}`)
    }

    const readMarkdown = async (path: string) => {
        const fileMarkdown = await readTextFile(path);
        const mdToHtml = await marked.parse(fileMarkdown)

        // Update the file state
        $slate.setFilePath(path);
        $slate.setSavedStatus(true);

        const uuid = $slate.createSlateDocument()
        $slate.setSlateDocumentMetadata({
            savesOnCloud: false,
        })
        $slate.setSlatePageContent(uuid, mdToHtml)
    }

    const readTXT = async (path: string) => {
        const textFile = await readTextFile(path);

        // Update the file state
        $slate.setFilePath(path);
        $slate.setSavedStatus(true);

        const uuid = $slate.createSlateDocument()
        $slate.setSlateDocumentMetadata({
            savesOnCloud: false,
        })
        $slate.setSlatePageContent(uuid, textFile)
    }

    return { importNote };
};