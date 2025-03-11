// useSlateConfig.ts - full implementation
import { BaseDirectory, exists, readTextFile, writeFile, mkdir } from '@tauri-apps/plugin-fs';
import type { SlateConfig, SlateDocumentConfig, SlateDocument, SlateMetadata } from '~/slate.types'

export const useSlateConfig = () => {
    const configFilePath = 'slate_config.json';
    const globalConfig = useState<SlateConfig>('globalSlateConfig', () => defaultSlateConfig());
    const globalConfigLoaded = useState<boolean>('globalConfigLoaded', () => false);

    /**
     * Initialize global configuration from disk
     */
    async function initGlobalConfig(): Promise<void> {
        try {
            // Ensure config directory exists
            const configDirExists = await exists('', { baseDir: BaseDirectory.AppConfig });
            if (!configDirExists) {
                await mkdir('', { baseDir: BaseDirectory.AppConfig, recursive: true });
            }

            // Check if config file exists
            const configExists = await exists(configFilePath, { baseDir: BaseDirectory.AppConfig });

            if (configExists) {
                // Load existing config
                const configData = await readTextFile(configFilePath, { baseDir: BaseDirectory.AppConfig });
                try {
                    const loadedConfig = JSON.parse(configData);
                    // Merge with defaults to ensure all properties exist
                    globalConfig.value = { ...defaultSlateConfig(), ...loadedConfig };
                } catch (e) {
                    console.error('Failed to parse config, using defaults', e);
                    globalConfig.value = defaultSlateConfig();
                }
            } else {
                // Create new config file with defaults
                globalConfig.value = defaultSlateConfig();
                await saveGlobalConfig();
            }

            globalConfigLoaded.value = true;
        } catch (error) {
            console.error('Error initializing config:', error);
            globalConfig.value = defaultSlateConfig();
            globalConfigLoaded.value = true;
        }
    }

    /**
     * Save global configuration to disk
     */
    async function saveGlobalConfig(): Promise<boolean> {
        try {
            const configJson = JSON.stringify(globalConfig.value, null, 2);
            const encoder = new TextEncoder();
            const data = encoder.encode(configJson);

            await writeFile(configFilePath, data, { baseDir: BaseDirectory.AppConfig });
            return true;
        } catch (error) {
            console.error('Error saving config:', error);
            return false;
        }
    }

    /**
     * Update global configuration with partial values
     */
    async function updateGlobalConfig(partialConfig: Partial<SlateConfig>): Promise<boolean> {
        globalConfig.value = {
            ...globalConfig.value,
            ...partialConfig
        };
        return saveGlobalConfig();
    }

    /**
     * Get current global configuration
     */
    function getGlobalConfig(): Readonly<Ref<SlateConfig>> {
        return globalConfig;
    }

    /**
     * Get document-specific configuration from the current document
     */
    function getDocumentConfig(): SlateDocumentConfig {
        const slateFile = useSlateFile();
        const currentDoc = unref(slateFile.getCurrentSlateDoc());

        if (!currentDoc || !currentDoc.metaData || !currentDoc.metaData.config) {
            return defaultSlateDocumentConfig();
        }

        // Return the document config, with defaults for any missing properties
        return {
            ...defaultSlateDocumentConfig(),
            ...currentDoc.metaData.config
        } satisfies SlateDocumentConfig;
    }

    /**
     * Update document-specific configuration
     */
    async function updateDocumentConfig(partialConfig: Partial<SlateDocumentConfig>): Promise<boolean> {
        const slateFile = useSlateFile();
        const currentDoc = unref(slateFile.getCurrentSlateDoc());

        if (!currentDoc) {
            console.error('No document loaded, cannot update document config');
            return false;
        }

        currentDoc.metaData = {
            ...defaultSlateMetadata(),
            ...currentDoc.metaData
        } satisfies SlateMetadata

        // Update the config with new values
        currentDoc.metaData.config = {
            ...defaultSlateDocumentConfig(),
            ...currentDoc.metaData.config,
            ...partialConfig
        } satisfies SlateDocumentConfig;

        // Mark document as unsaved
        slateFile.setSavedStatus(false);

        // Trigger auto-save
        useNoteSaver().autoSave();

        return true;
    }

    /**
     * Reset document configuration to defaults
     */
    async function resetDocumentConfig(): Promise<boolean> {
        return updateDocumentConfig(defaultSlateDocumentConfig());
    }

    /**
     * Check if global config is loaded
     */
    function isGlobalConfigLoaded(): boolean {
        return globalConfigLoaded.value;
    }

    /**
     * Get combined configuration (global + document overrides)
     */
    function getCombinedConfig(): SlateConfig & SlateDocumentConfig {
        const global = unref(globalConfig);
        const document = getDocumentConfig();

        return {
            ...global,
            ...document
        };
    }

    return {
        initGlobalConfig,
        saveGlobalConfig,
        updateGlobalConfig,
        getGlobalConfig,
        getDocumentConfig,
        updateDocumentConfig,
        resetDocumentConfig,
        isGlobalConfigLoaded,
        getCombinedConfig,
    };
};
