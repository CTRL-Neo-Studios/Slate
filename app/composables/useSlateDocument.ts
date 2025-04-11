import type { SdxFileConfig, SdxFileMetadata, SdxPage } from '~/types/sdx.types'
import { useSlateFileIO } from '~/composables/useSlateFileIO'
import { open } from '@tauri-apps/plugin-dialog'

export function useSlateDocument() {
    const $t = useToast()

    const $sio = useSlateFileIO()
    const _docConfig = useState<SdxFileConfig | null>(() => null)
    const _docMetadata = useState<SdxFileMetadata | null>(() => null)
    const _slatePages = useState<SdxPage[]>(() => [])

    function getDocuments() {

    }

    async function loadDocument() {
        const selectedFile = await open({
            filters: [{
                name: 'Slate Document Extended Format',
                extensions: ['sdx', 'md', 'txt'],
            }],
        });

        if(!selectedFile)
            $t.add({
                title: 'No file was selected.',
                color: 'info',
                icon: 'lucide:info'
            })
        else {
            if (selectedFile.endsWith(".sdx")) {
                const {pages, assets, config, metadata} = await $sio.loadFile(selectedFile)
            }
        }
    }

    return {
        getDocuments
    }
}