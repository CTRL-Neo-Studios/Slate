import { writeFile, readFile } from '@tauri-apps/plugin-fs';
import { SlateModalWarning } from '#components'
import { exit } from '@tauri-apps/plugin-process'
import JSZip from 'jszip'
import type { SdxFileConfig, SdxFileMetadata, SdxPage } from '~/types/sdx.types'
import { useQuickToasts } from '~/composables/useQuickToasts'

export function useSlateFileIO() {
    const $t = useToast();
    const $qt = useQuickToasts()
    const $m = useOverlay();
    const $config = useSlateConfig();
    const $sdoc = useSlateDocument()

    const $filePath = useState<string | null>('sfio.sdxFilePath', () => null) // Tracks the current file path
    const $lastLoadedFilePath = useState<string | null>('sfio.lastLoadedFilePath', () => null)

    const METADATA_FILE = 'metadata.json'
    const SERVER_FILE = 'server.json'
    const CONFIG_FILE = 'config.json'
    const PAGES_FOLDER = '/pages'
    const IMAGES_FOLDER = '/assets/images'

    let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;


    async function saveFile(notifyOutput: boolean = false) {
        const zip = new JSZip();
        const { pages, assets, config } = unref($sdoc.getDocuments());

        // 1. Save each page individually
        const pagesFolder = zip.folder("pages");
        for (const page of pages) {
            pagesFolder.file(`${page.uuid}.json`, JSON.stringify(page));
        }

        // 2. Save binary assets
        const assetsFolder = zip.folder("assets/images");
        for (const [id, image] of Object.entries(assets.images)) {
            assetsFolder.file(`${id}.${image.ext}`, image.binaryData, { binary: true });
        }

        // 3. Add metadata & config
        zip.file("metadata.json", JSON.stringify({
            fileUuid: generateUUID(),
            version: 4,
            createdAt: new Date().toISOString(),
        }));

        zip.file("config.json", JSON.stringify(config));

        // Generate and save .sdx
        const zipData = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
        await writeFile(targetPath, zipData);
    }

    function autoSave() {
        // Clear the previous timeout if it exists
        clearCurrentAutoSave()

        // Set a new timeout for auto-saving
        autoSaveTimeout = setTimeout(async () => {
            console.log('Auto-saving note...');
            await saveFile(); // Call the saveNote function
        }, $config.getGlobalConfig().autosaveInterval * 1000); // 5 seconds delay
    }

    function clearCurrentAutoSave() {
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
        }
    }

    function saveBeforeQuit() {
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

    async function loadFile(filePath: string) {
        try {
            if(!filePath)
                throw new Error('File path is invalid.')

            const zipData = await readFile(filePath)
            const zip = await JSZip.loadAsync(zipData)
            const config: SdxFileConfig = JSON.parse(await zip.file(CONFIG_FILE)?.async('text') || '') as SdxFileConfig
            const metadata: SdxFileMetadata = JSON.parse(await zip.file(METADATA_FILE)?.async('text') || '') as SdxFileMetadata

            const pages: SdxPage[] = []
            const pagesFolder = zip.folder('pages')

            for (const [name, file] of Object.entries(pagesFolder?.files || [])) {
                if (!name.endsWith('.json')) continue
                pages.push(JSON.parse(await file.async('text')) as SdxPage)
            }

            $lastLoadedFilePath.value = filePath

            // 3. Lazy-load assets (or preload critical ones)
            return { metadata, config, pages, assets: zip.folder('assets') }
        } catch (e: any) {
            $qt.error('Error', e.message as string)
        }
    }

    return {
        saveFile,
        autoSave,
        saveBeforeQuit,
        clearCurrentAutoSave,
        loadFile
    }
}