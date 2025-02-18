import { Menu, Submenu, MenuItem, PredefinedMenuItem, CheckMenuItem, IconMenuItem, type MenuItemOptions, type SubmenuOptions, type IconMenuItemOptions, type PredefinedMenuItemOptions, type CheckMenuItemOptions } from '@tauri-apps/api/menu'
import type { Editor } from '@tiptap/vue-3'

type MenuTypes = (Submenu | MenuItem | PredefinedMenuItem | CheckMenuItem | IconMenuItem | MenuItemOptions | SubmenuOptions | IconMenuItemOptions | PredefinedMenuItemOptions | CheckMenuItemOptions)
export const useAppMenu = () => {
    const $import = useNoteImporter()
    const $saver = useNoteSaver()
    const $export = useNoteExporter()


    const init = async (editor: Ref<Editor | undefined>) => {
        try {
            const copy = await PredefinedMenuItem.new({
                text: 'Copy',
                item: 'Copy',
            });

            const separator = await PredefinedMenuItem.new({
                text: 'separator-text',
                item: 'Separator',
            });

            const undo = await PredefinedMenuItem.new({
                text: 'Undo',
                item: 'Undo',
            });

            const redo = await PredefinedMenuItem.new({
                text: 'Redo',
                item: 'Redo',
            });

            const cut = await PredefinedMenuItem.new({
                text: 'Cut',
                item: 'Cut',
            });

            const paste = await PredefinedMenuItem.new({
                text: 'Paste',
                item: 'Paste',
            });

            const select_all = await PredefinedMenuItem.new({
                text: 'Select All',
                item: 'SelectAll',
            });

            const slateMenu: MenuTypes[] = [
                {
                    id: 'quit',
                    text: 'Quit',
                    accelerator: 'CommandOrControl+Q',
                    action: async () => {
                        $saver.saveBeforeQuit()
                    },
                },
            ]
            const fileMenu: MenuTypes[] = [
                {
                    id: 'new',
                    text: 'New',
                    accelerator: 'CommandOrControl+N',
                    action: async () => {
                        console.log('New File');
                    },
                },
                {
                    id: 'open',
                    text: 'Open...',
                    accelerator: 'CommandOrControl+O',
                    action: async () => {
                        console.log('Open File');
                        await $import.importNote(editor)
                    },
                },
                {
                    id: 'save',
                    text: 'Save',
                    accelerator: 'CommandOrControl+S',
                    action: async () => {
                        console.log('Save File');
                        await $saver.saveNote(editor)
                    },
                },
                separator,
                {
                    id: 'export-markdown',
                    text: 'Export as Markdown',
                    action: async () => {
                        console.log('Export as Markdown');
                        await $export.exportToMarkdown(editor.value?.getText(), null)
                        // Add logic for exporting to Markdown
                    },
                },
                {
                    id: 'export-pdf',
                    text: 'Export as PDF',
                    action: async () => {
                        console.log('Export as PDF');
                        await $export.exportToPDF(editor.value?.getHTML())
                        // Add logic for exporting to PDF
                    },
                },
            ];

            // Define menu items for the "Edit" menu
            const editMenu: MenuTypes[] = [
                copy, paste, cut, select_all, separator, undo, redo,
            ];

            // Create the main menu
            const menu = await Menu.new({
                items: [
                    {
                        id: 'main',
                        text: 'Slate',
                        items: slateMenu,
                    },
                    {
                        id: 'file',
                        text: 'File',
                        items: fileMenu,
                    },
                    {
                        id: 'edit',
                        text: 'Edit',
                        items: editMenu,
                    },
                    {
                        id: 'view',
                        text: 'View',
                        items: [], // Empty View menu
                    },
                    {
                        id: 'window',
                        text: 'Window',
                        items: [], // Empty Window menu
                    },
                    {
                        id: 'help',
                        text: 'Help',
                        items: [], // Empty Help menu
                    },
                ],
            });

            // Set the menu as the app menu
            await menu.setAsAppMenu();
            console.log('Menu set successfully');
        } catch (error) {
            console.error('Error setting up app menu:', error);
        }
    }
    return {init}
};