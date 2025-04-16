import { writeFile, readFile, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs'
import { SlateModalWarning } from '#components'
import { exit } from '@tauri-apps/plugin-process'
import JSZip from 'jszip'
import type { SdxFileConfig, SdxFileMetadata, SdxPage } from '~/types/sdx.types'
import { useQuickToasts } from '~/composables/useQuickToasts'
import { useSlateDocument } from '~/composables/useSlateDocument'
import type { PossiblyRef } from '~/types/utility.types'
import { marked } from 'marked'
import { sdxDefaults } from '~/utils/sdx_utils'

/**
 * The layer that writes, reads, and modifies the .sdx files directly.
 */
export function useSlateFileIO() {
    const $t = useToast();
    const $qt = useQuickToasts()
    const $m = useOverlay();
    const $config = useSlateConfig();
    const $sdoc = useSlateDocument()

    const $sdxFilePath = useState<string | null>('sfio.sdxFilePath', () => null) // Tracks the current file path
    const $lastLoadedFilePath = useState<string | null>('sfio.lastLoadedFilePath', () => null)

    const METADATA_FILE = 'metadata.json'
    const SERVER_FILE = 'server.json'
    const CONFIG_FILE = 'config.json'
    const PAGES_FOLDER = 'pages'
    const CANVASES_FOLDER = 'canvases'
    const ASSETS_FOLDER = "assets"
    const IMAGES_FOLDER = `${ASSETS_FOLDER}/images`
    const CONTENT_DB = 'content.db'

    let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;


    async function saveFile(targetPath: PossiblyRef<string | null>, notifyOutput: boolean = false) {
        const path = unref(targetPath)
        if(!path) {
            $qt.error('Error', 'Target save path is invalid. Please select a valid save path.')
            return
        }

        const zip = new JSZip();
        const { pages, config, metadata } = $sdoc.getDocument()

        // save each page individually
        const pagesFolder = zip.folder(PAGES_FOLDER);
        for (const page of unref(pages)) {
            pagesFolder?.file(`${page.uuid}.json`, JSON.stringify(page));
        }

        // metadata & config
        zip.file(METADATA_FILE, JSON.stringify(unref(metadata)));
        zip.file(CONFIG_FILE, JSON.stringify(unref(config)));

        // Generate and save .sdx
        const zipData = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
        await writeFile(path, zipData);
    }

    /**
     * Creates the concurrent auto save task to be executed after configured seconds.
     */
    function autoSave() {
        // Clear the previous timeout if it exists
        clearCurrentAutoSave()

        // Set a new timeout for auto-saving
        autoSaveTimeout = setTimeout(async () => {
            console.log('Auto-saving note...');
            if (isSdxFile())
                await saveFile($lastLoadedFilePath); // Call the saveNote function
            else
                await saveTextFile($lastLoadedFilePath, '') // TODO: add saved content here.
        }, $config.getGlobalConfig().autosaveInterval * 1000); // 5 seconds delay
    }

    /**
     * Stops the scheduled concurrent auto save task.
     */
    function clearCurrentAutoSave() {
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
        }
    }

    function saveBeforeQuit() { // no impl. for now
        // if (!$slate.isFileSaved().value || !unref($slate.getFilePath())) {
        //     $m.create(SlateModalWarning, {
        //         props: {
        //             title: 'Quitting Slate',
        //             description: 'Your current note is unsaved! Are you sure you want to quit right now without saving?',
        //             optCancelLabel: 'Don\'t Quit',
        //             optConfirmLabel: 'Quit Without Saving',
        //             async onConfirm() {
        //                 await exit(0)
        //             },
        //         },
        //     }).open()
        // } else {
        //     $m.create(SlateModalWarning, {
        //         props: {
        //             title: 'Quitting Slate',
        //             description: 'Are you sure you want to quit?',
        //             async onConfirm() {
        //                 await exit(0)
        //             },
        //         },
        //     }).open()
        // }
    }

    /**
     * Loads the said file (.sdx, .md, .txt) into Slate Document Extended Format.
     *
     * Sets the <code>$sdxFilePath</code> to the file path if the given file path is an .sdx file; if not, sets to empty.
     * Sets the <code>$lastLoadedFilePath</code> if the given file has loaded correctly, regardless of file format.
     *
     * @param filePath The path to the file.
     */
    async function loadFile(filePath: PossiblyRef<string>) {
        const path = unref(filePath)

        if(!path)
            throw new Error('File path is invalid.')

        let config: SdxFileConfig = sdxDefaults().defaultConfig(),
            metadata: SdxFileMetadata = sdxDefaults().defaultMetadata(),
            pages: SdxPage[] = []
        $sdxFilePath.value = ''

        if (path.endsWith('.sdx')) {
            // Parsing Slate Document Extended

            const zipData = await readFile(path)
            const zip = await JSZip.loadAsync(zipData)
            config = JSON.parse(await zip.file(CONFIG_FILE)?.async('text') || '') as SdxFileConfig
            metadata = JSON.parse(await zip.file(METADATA_FILE)?.async('text') || '') as SdxFileMetadata

            const pagesFolder = zip.folder('pages')

            for (const [name, file] of Object.entries(pagesFolder?.files || [])) {
                if (!name.endsWith('.json')) continue
                pages.push(JSON.parse(await file.async('text')) as SdxPage)
            }

            $sdxFilePath.value = path
        } else if (path.endsWith('.md')) {
            // Parsing Markdown

            const fileMarkdown = await readTextFile(path);
            const mdToHtml = await marked.parse(fileMarkdown)

            metadata = sdxDefaults().defaultMetadata()
            config = sdxDefaults().defaultConfig()
            pages.push(sdxDefaults().defaultPage({
                content: mdToHtml
            }))
        } else {
            // Parsing Plain Text File

            const fileText = await readTextFile(path);

            metadata = sdxDefaults().defaultMetadata()
            config = sdxDefaults().defaultConfig()
            pages.push(sdxDefaults().defaultPage({
                content: fileText
            }))
        }

        // The reason for generating .sdx defaults while loading .md and .txt files is because the general logic of
        // slate's system is built around .sdx, not plain text editing, so in order to retain headless editing functions for
        // the editor we have to generate .sdx defaults so that the system works. Though, headless editing of files will
        // yield results with less prose when saved, so it's better to save as an .sdx file instead.

        if (pages.length <= 0)
            pages.push(sdxDefaults().defaultPage())

        // The reason for adding more null-safety upserts above is because typescript somehow fucking thinks the variables
        // are still fucking uninitialized after the if-else block. Goddamnit typescript is so annoying sometimes

        $lastLoadedFilePath.value = path

        return { metadata, config, pages }
    }

    /**
     * Writes the given content to the file of the given file path.
     *
     * This function is mainly for headless editing; for when users don't like to save the file as an .sdx but wants to
     * save the file as their original text format.
     *
     * @param filePath The path to the file.
     * @param content The content to write into the file.
     */
    async function saveTextFile(filePath: PossiblyRef<string | null>, content: PossiblyRef<string>) {
        const path = unref(filePath)
        if(!path) {
            $qt.error('Error', 'Target save path is invalid. Please select a valid save path.')
            return
        }

        await writeTextFile(path, unref(content))
    }

    async function upsertPageToFile(page?: SdxPage) {
        if (!isSdxFile()) {
            $qt.error('Error', 'The file is not a Slate Document Extended File.');
            return false;
        }

        const path = unref($sdxFilePath);
        if (!path) {
            $qt.error('Error', 'Target save path is invalid. Please select a valid save path.');
            return false;
        }

        const savePage = sdxDefaults().defaultPage(page);
        const pagePath = `${PAGES_FOLDER}/${savePage.uuid}.json`;

        try {
            // loads existing .sdx file as zip
            const zipData = await readFile(path);
            const zip = await JSZip.loadAsync(zipData);

            // updates the specific page
            const savePage = sdxDefaults().defaultPage(page);
            zip.file(pagePath, JSON.stringify(savePage));

            // updates metadata timestamp
            const metadata = JSON.parse(await zip.file(METADATA_FILE)?.async('text') || '{}') as SdxFileMetadata;
            metadata.modifiedAt = new Date().toISOString();
            zip.file(METADATA_FILE, JSON.stringify(metadata));

            // regenerates .sdx file (jszip doesn't support true partial updates for some goddamned reason)
            await writeFile(path, await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" }));

            return true
        } catch (error) {
            $qt.error('Error', `Failed to update page: ${error instanceof Error ? error.message : String(error)}`);
        }

        return false;
    }

    function isSdxFile() {
        return unref($lastLoadedFilePath)?.endsWith('.sdx')
    }

    function isSdxFileNull() {
        return unref($sdxFilePath) == undefined
    }

    function isMarkdownFile() {
        return unref($lastLoadedFilePath)?.endsWith('.md')
    }

    function isTextFile() {
        return unref($lastLoadedFilePath)?.endsWith('.txt')
    }

    function setSdxFilePath(path: PossiblyRef<string>) {
        $sdxFilePath.value = unref(path)
    }

    function clearSdxFilePath() {
        $sdxFilePath.value = ''
    }

    async function saveSdxFile() {
        return await saveFile($sdxFilePath)
    }

    async function saveNonSdxFile(content?: string) {
        return await saveTextFile($lastLoadedFilePath, content || '')
    }

    return {
        saveFile,
        saveTextFile,
        autoSave,
        saveBeforeQuit,
        clearCurrentAutoSave,
        loadFile,
        isSdxFile,
        isMarkdownFile,
        isTextFile,
        isSdxFileNull,
        setSdxFilePath,
        clearSdxFilePath,
        saveSdxFile,
        saveNonSdxFile
    }
}