import { Menu, Submenu, MenuItem, PredefinedMenuItem, CheckMenuItem, IconMenuItem } from '@tauri-apps/api/menu'

export const useAppMenu = () => {
    const $import = useNoteImporter()
    const $saver = useNoteSaver()
    const $export = useNoteExporter()
    const $slate = useSlateFile()
    const $config = useSlateConfig()
    const $route = useRoute()
    const previousRoute = useState<string>(() => '')

    const isEditingDocument = computed(() => $route.fullPath.startsWith('/document'))

    const init = async () => {
        try {
            // Create predefined menu items
            const copy = await PredefinedMenuItem.new({
                text: 'Copy',
                item: 'Copy',
            })

            const separator = await PredefinedMenuItem.new({
                text: 'separator-text',
                item: 'Separator',
            })

            const undo = await PredefinedMenuItem.new({
                text: 'Undo',
                item: 'Undo',
            })

            const redo = await PredefinedMenuItem.new({
                text: 'Redo',
                item: 'Redo',
            })

            const cut = await PredefinedMenuItem.new({
                text: 'Cut',
                item: 'Cut',
            })

            const paste = await PredefinedMenuItem.new({
                text: 'Paste',
                item: 'Paste',
            })

            const selectAll = await PredefinedMenuItem.new({
                text: 'Select All',
                item: 'SelectAll',
            })

            // Create Slate menu items
            const settingsItem = await MenuItem.new({
                id: 'settings',
                text: 'Settings...',
                accelerator: 'CommandOrControl+,',
                action: async () => {
                    await $config.openConfig(useRoute().fullPath)
                },
            })

            const quitItem = await MenuItem.new({
                id: 'quit',
                text: 'Quit',
                accelerator: 'CommandOrControl+Q',
                action: async () => {
                    $saver.saveBeforeQuit()
                },
            })

            // Create File menu items
            const newFileItem = await MenuItem.new({
                id: 'new',
                text: 'New',
                accelerator: 'CommandOrControl+N',
                action: async () => {
                    console.log('New File')
                    $slate.createSlateDocument()
                },
            })

            const openFileItem = await MenuItem.new({
                id: 'open',
                text: 'Open...',
                accelerator: 'CommandOrControl+O',
                action: async () => {
                    console.log('Open File')
                    await $import.importNote()
                },
            })

            const saveFileItem = await MenuItem.new({
                id: 'save',
                text: 'Save',
                accelerator: 'CommandOrControl+S',
                action: async () => {
                    console.log('Save File')
                    await $saver.saveNote()
                }
            })

            // Uncomment and adjust these if you want to include export functionality
            /*
            const exportMarkdownItem = await MenuItem.new({
                id: 'export-markdown',
                text: 'Export as Markdown',
                action: async () => {
                    console.log('Export as Markdown')
                    await $export.exportToMarkdown(editor)
                },
                enabled: isEditingDocument.value
            })

            const exportPdfItem = await MenuItem.new({
                id: 'export-pdf',
                text: 'Export as PDF',
                action: async () => {
                    console.log('Export as PDF')
                    await $export.exportToPDF(editor)
                },
                enabled: isEditingDocument.value
            })
            */

            // Assemble menu sections
            const slateSubmenu = await Submenu.new({
                id: 'main',
                text: 'Slate',
                items: [
                    settingsItem,
                    separator,
                    quitItem,
                ],
            })

            const fileSubmenu = await Submenu.new({
                id: 'file',
                text: 'File',
                items: [
                    newFileItem,
                    openFileItem,
                    saveFileItem,
                    // Uncomment if using export functionality
                    // separator,
                    // exportMarkdownItem,
                    // exportPdfItem,
                ],
            })

            const editSubmenu = await Submenu.new({
                id: 'edit',
                text: 'Edit',
                items: [
                    copy,
                    paste,
                    cut,
                    selectAll,
                    separator,
                    undo,
                    redo,
                ],
            })

            // Optional: You can add these other submenus if needed
            /*
            const viewSubmenu = await Submenu.new({
                id: 'view',
                text: 'View',
                items: [],
            })

            const windowSubmenu = await Submenu.new({
                id: 'window',
                text: 'Window',
                items: [],
            })

            const helpSubmenu = await Submenu.new({
                id: 'help',
                text: 'Help',
                items: [],
            })
            */

            // Create and set the application menu
            const menu = await Menu.new({
                items: [
                    slateSubmenu,
                    fileSubmenu,
                    editSubmenu,
                    // Uncomment if using these optional submenus
                    // viewSubmenu,
                    // windowSubmenu,
                    // helpSubmenu,
                ],
            })

            // Set as application menu
            await menu.setAsAppMenu()
            previousRoute.value = $route.fullPath
            console.log('Menu set successfully')
        } catch (error) {
            console.error('Error setting up app menu:', error)
        }
    }

    return { init }
}
