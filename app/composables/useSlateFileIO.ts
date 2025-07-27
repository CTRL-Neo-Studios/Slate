import {
    BaseDirectory,
    exists,
    mkdir,
    readDir,
    readFile,
    remove,
    writeFile,
    writeTextFile,
} from '@tauri-apps/plugin-fs'
import JSZip from 'jszip'
import type { SdxFileConfig, SdxFileMetadata, SdxPage } from '~/types/sdx.types'
import { useQuickToasts } from '~/composables/useQuickToasts'
import { useSlateDocument } from '~/composables/useSlateDocument'
import type { PossiblyRef } from '~/types/utility.types'
import { sdxDefaults } from '~/utils/sdx_utils'
import { join } from '@tauri-apps/api/path'

export interface LoadedSdxData {
    metadata: SdxFileMetadata;
    config: SdxFileConfig;
    bufferDbDir?: string;
    bufferImagesDir?: string;
    bufferDir?: string;
}

// Data needed by saveFile internally
interface SdxSaveData {
    metadata: SdxFileMetadata; // No longer refs needed here
    config: SdxFileConfig;
}

/**
 * The layer that writes, reads, and modifies the .sdx files directly.
 */
export function useSlateFileIO() {
    const $t = useToast();
    const $qt = useQuickToasts()
    const $m = useOverlay();
    const $config = useSlateConfig();
    const $sdoc = useSlateDocument()

    const $sdxFilePath = useState<string>('sfio.sdxFilePath', () => '') // Tracks the current file path
    const $lastLoadedFilePath = useState<string>('sfio.lastLoadedFilePath', () => '')
    const $bufferPath = useState<string>('sfio.bufferPath', () => '')
    const $lastBufferPath = useState<string>('sfio.lastBufferPath', () => '')

    const METADATA_FILE = 'metadata.json';
    const CONFIG_FILE = 'config.json';
    const CONTENT_DB = 'content.db';
    const IMAGES_FOLDER = "images";

    const TEMP_BUFFER_FOLDER = '.temp_buffer'

    let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;


    /**
     * Saves the provided document state and the contents in the buffer to an .sdx file at the target path.
     * This function requires the *actual data* to be passed in.
     */
    async function saveFile(
        targetSdxPath: string, // Changed PossiblyRef -> string
        currentData: SdxSaveData, // Use the interface for clarity
        notifyOutput: boolean = false
    ) {
        if (!targetSdxPath || (!targetSdxPath.endsWith('.sdx') || !targetSdxPath.endsWith('.md') || !targetSdxPath.endsWith('.txt'))) {
            $qt.error('Error', 'Target save path is invalid.');
            return false; // Indicate failure
        }

        // Destructure data for easier access
        const { metadata, config } = currentData;

        if (!metadata || !config) {
            $qt.error('Error', 'Cannot save: Metadata or Config is missing.');
            return false;
        }

        const bufferPath = await join('Slate', TEMP_BUFFER_FOLDER, metadata.fileUuid)

        $qt.info('Saving...', `Saving project to ${targetSdxPath}`);
        try {
            const zip = new JSZip();
            const dbPath = await join(bufferPath, CONTENT_DB)

            // 1. Add metadata & config (using the passed data)
            zip.file(METADATA_FILE, JSON.stringify(metadata)); // zips the file to .sdx/metadata.json
            zip.file(CONFIG_FILE, JSON.stringify(config)); // zips the file to .sdx/config.json

            // 2. Add content.db (using the passed dbPath)
            try {
                const dbData: Uint8Array = await readFile(dbPath, { baseDir: BaseDirectory.AppData }); // reads the .db file from buffer
                zip.file(CONTENT_DB, dbData); // zips the file to .sdx/content.db
            } catch (dbError: any) {
                console.error("Error reading database file:", dbError);
                $qt.error('Warning', `Could not read database file at ${dbPath}: ${dbError.message || dbError}. It will not be included.`);
            }

            // 3. Add images folder and content (using passed imagesBasePath)
            const imagesFolderZip = zip.folder(IMAGES_FOLDER); // adds folder to .sdx/images/
            const imagesBasePath = await join(bufferPath, IMAGES_FOLDER) // the images/ folder in the buffer
            if (imagesFolderZip) {
                try {
                    const imageFiles = await readDir(imagesBasePath, { baseDir: BaseDirectory.AppData }); // reads the files under the images folder in the buffer
                    for (const entry of imageFiles) {
                        if (entry.isFile) {
                            const relativePath = await join(imagesBasePath, entry.name);
                            const imageData: Uint8Array = await readFile(relativePath, {baseDir: BaseDirectory.AppData});
                            imagesFolderZip.file(await join(IMAGES_FOLDER, entry.name), imageData); // zips the file to the relative dir in the zip, .sdx/images/[imageUUID].(image format)
                        }
                    }
                } catch (imgError: any) {
                    console.error("Error reading images directory:", imgError);
                    $qt.error('Warning', `Could not fully read images directory at ${imagesBasePath}: ${imgError.message || imgError}.`);
                }
            }

            // 4. Generate and save .sdx
            const zipData = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
            await writeFile(targetSdxPath, zipData);

            if (notifyOutput) {
                $qt.success('Saved!', `Project saved successfully to ${targetSdxPath}`);
            }

            return true; // Indicate success

        } catch (error: any) {
            console.error("Error during save process:", error);
            $qt.error('Save Failed', `Failed to save project: ${error.message || error}`);
            return false; // Indicate failure
        }
    }

    // --- Auto Save Logic (Needs Adjustment) ---
    // Autosave is very complex.
    // Since the save now saves the entire buffer to the file... the process could be very slow.
    // Partially updating a zip is tricky... at least, JSZip doesn't allow that.
    // For now, autosave triggers a full SDX save if applicable.
    function autoSave(currentData: Parameters<typeof saveFile>[1]) {
        clearCurrentAutoSave();
        autoSaveTimeout = setTimeout(async () => {
            console.log('Auto-saving...');
            if (isSdxFile() && $sdxFilePath.value) {
                // Need to pass the current state from useSlateDocument
                await saveFile($sdxFilePath.value, currentData);
            } else if ($lastLoadedFilePath.value && !isSdxFile()) {
                // Need to get current text content from editor state
                // const content = getCurrentEditorContentAsText(); // Placeholder
                // await saveNonSdxFile(content);
                console.warn("Auto-save for non-sdx files needs editor content retrieval.");
            }
        }, ($config.getGlobalConfig()?.autosaveInterval || 30) * 1000); // Use optional chaining and default
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
     * Loads the specified file. Extracts .sdx to temp dir.
     * Returns **_RELATIVE_** paths and loaded metadata/config.
     */
    async function loadFile(filePath: string): Promise<LoadedSdxData | undefined> { // Changed PossiblyRef -> string
        // ... (Setup, cleanup old temp dir - logic remains the same) ...
        let config: SdxFileConfig = sdxDefaults().defaultConfig();
        let metadata: SdxFileMetadata = sdxDefaults().defaultMetadata();
        let extractedDbPath: string = '';
        let extractedImagesPath: string = '';
        let tempExtractDir: string = '';

        $sdxFilePath.value = ''; // Reset

        try {
            if (unref($lastLoadedFilePath) == filePath) throw new Error('File is already loaded.');

            if (filePath.endsWith('.sdx')) {
                tempExtractDir = await join("Slate", TEMP_BUFFER_FOLDER) // tempExtractDir here should be Slate/.temp_buffer
                if (!(await exists(tempExtractDir, { baseDir: BaseDirectory.AppData }))) // If the buffer dir doesn't exist, create it
                    await mkdir(tempExtractDir, { baseDir: BaseDirectory.AppData, recursive: true });

                const zipData = await readFile(filePath);
                const zip = await JSZip.loadAsync(zipData);

                // extract metadata & config
                metadata = sdxDefaults().defaultMetadata(JSON.parse(await zip.file(METADATA_FILE)?.async('text') ?? '{}') as SdxFileMetadata);
                config = sdxDefaults().defaultConfig(JSON.parse(await zip.file(CONFIG_FILE)?.async('text') ?? '{}') as SdxFileConfig);

                tempExtractDir = await join(tempExtractDir, metadata.fileUuid) // tempExtractDir here should be Slate/.temp_buffer/[fileUUID]
                if (await exists(tempExtractDir, { baseDir: BaseDirectory.AppData })) // checks for old buffer and removes it
                    // $qt.info('Open File', 'Overriding old buffer with file contents.')
                    await remove(tempExtractDir, { baseDir: BaseDirectory.AppData, recursive: true })

                await mkdir(tempExtractDir, {baseDir: BaseDirectory.AppData, recursive: true}) // makes the buffer dir

                $bufferPath.value = tempExtractDir; // setting buffer path value after making the checks

                const dbFile = zip.file(CONTENT_DB); // extracts the file data of content.db from the zip file
                if (dbFile) {
                    const dbData = await dbFile.async('uint8array');
                    extractedDbPath = await join(tempExtractDir, CONTENT_DB); // extractedDbPath is Slate/.temp_buffer/[fileUUID]/content.db
                    await writeFile(extractedDbPath, dbData, { baseDir: BaseDirectory.AppData }); // writes the content.db into the buffer
                    console.log(`Database file extracted to: ${extractedDbPath}`);
                    // TODO: set the db path ($APPDATA/extractedDbPath) to the drizzle orm driver.
                } else {
                    throw new Error('This file is corrupted or broken; its contents cannot be read.')
                }

                // Extract images (logic remains same)
                const imagesFolderPath = await join(tempExtractDir, IMAGES_FOLDER); // imagesFolderPath & extractedImagesPath is Slate/.temp_buffer/[fileUUID]/images/
                extractedImagesPath = imagesFolderPath;
                await mkdir(imagesFolderPath, { baseDir: BaseDirectory.AppData, recursive: true }); // makes the images folder in the directory
                for (const relativePath in zip.files) {
                    if(!zip.files[relativePath]) continue
                    if (relativePath.startsWith(IMAGES_FOLDER + '/') && !zip.files[relativePath].dir) { // check if the files in the zip are under the images/ folder and that the listed file in the path is not a directory

                        const imageFile = zip.files[relativePath];
                        let imageData = null
                        try {
                            imageData = await imageFile.async('uint8array')
                        } catch (e) {
                            console.log(`Skipping image file ${imageFile} in zip, image is potentially corrupted`)
                            continue
                        }

                        if(!imageData) continue // skips extracting this image if its empty

                        const targetImagePath = await join(tempExtractDir, relativePath); // relativePath is images/[imageUUID].(png/jpeg/webp/etc...), so joining it would make targetImagePath be Slate/.temp_buffer/[fileUUID]/images/[imageUUID].(png/jpeg/webp/etc...)
                        const parentDir = await join(targetImagePath, '..'); // parentDir is Slate/.temp_buffer/[fileUUID]/images/

                        await mkdir(parentDir, { baseDir: BaseDirectory.AppData, recursive: true }); // makes the folder
                        await writeFile(targetImagePath, imageData, { baseDir: BaseDirectory.AppData }); // writes the image file into the buffer from the zip
                    }
                }
                console.log(`Images extracted to: ${extractedImagesPath}`);

                $sdxFilePath.value = filePath; // Track successfully loaded SDX

            } else if (filePath.endsWith('.md')) {
                // ... (Handle MD - logic remains same, no DB/Images extracted) ...
            } else {
                // ... (Handle TXT - logic remains same, no DB/Images extracted) ...
            }

            $lastLoadedFilePath.value = filePath;

            return { metadata, config, bufferDbDir: extractedDbPath, bufferImagesDir: extractedImagesPath, bufferDir: tempExtractDir }; // No pages returned

        } catch (error: any) {
            $qt.error('Error', error.message)
        }
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
        return await saveFile(unref($sdxFilePath), {
            metadata: unref($sdoc.getDocument().metadata),
            config: unref($sdoc.getDocument().config)
        })
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