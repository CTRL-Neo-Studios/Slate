import TurndownService from 'turndown';
import { save } from '@tauri-apps/plugin-dialog';
import { marked } from 'marked'
import { writeTextFile, writeFile } from '@tauri-apps/plugin-fs'
import type { Editor } from '@tiptap/vue-3'

export function useNoteExporter() {
    const $t = useToast()

    const exportToPlainText = async (editor: Ref<Editor | undefined>) => {
        try {
            const filePath = await save({
                filters: [{
                    name: 'Plain Text',
                    extensions: ['txt']
                }]
            });

            if (filePath) {
                await writeTextFile(filePath, editor.value?.getText() || '');
                $t.add({
                    title: 'Exported Document to Markdown!',
                    description: `Exported to ${filePath}`,
                    color: 'success',
                    icon: 'lucide:check'
                })
                console.log('Markdown exported successfully:', filePath);
            }
        } catch (error) {
            $t.add({
                title: 'An error occurred while exporting document to markdown.',
                description: `${error}`,
                color: 'error',
                icon: 'lucide:error'
            })
            console.error('Error exporting to Markdown:', error);
        }
    }

    const exportToMarkdown = async (editor: Ref<Editor | undefined>) => {
        try {
            const turndownService = new TurndownService();

            const fullMarkdown = turndownService.turndown(editor.value?.getHTML() || '')

            const filePath = await save({
                filters: [{
                    name: 'Markdown',
                    extensions: ['md']
                }]
            });

            if (filePath) {
                await writeTextFile(filePath, fullMarkdown);
                $t.add({
                    title: 'Exported Document to Markdown!',
                    description: `Exported to ${filePath}`,
                    color: 'success',
                    icon: 'lucide:check'
                })
                console.log('Markdown exported successfully:', filePath);
            }
        } catch (error) {
            $t.add({
                title: 'An error occurred while exporting document to markdown.',
                description: `${error}`,
                color: 'error',
                icon: 'lucide:error'
            })
            console.error('Error exporting to Markdown:', error);
        }
    };

    const exportToPDF = async (contentHtml: any) => {
        // try {
        //     // Generate PDF from HTML
        //     const pdfOptions: CreateOptions = { format: 'A4' }; // Customize PDF options
        //     const pdfBuffer = await new Promise((resolve, reject) => {
        //         htmlpdf.create(contentHtml).toBuffer((err, buffer) => {
        //             if (err) reject(err);
        //             else resolve(buffer);
        //         });
        //     });
        //
        //     // Save the PDF file
        //     const filePath = await save({
        //         filters: [{
        //             name: 'PDF',
        //             extensions: ['pdf']
        //         }]
        //     });
        //
        //     if (filePath) {
        //         await writeFile(filePath, pdfBuffer as any);
        //         console.log('PDF exported successfully:', filePath);
        //     }
        // } catch (error) {
        //     console.error('Error exporting to PDF:', error);
        // }
    };

    return { exportToMarkdown, exportToPDF };
}