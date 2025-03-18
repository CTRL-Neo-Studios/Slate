import TurndownService from 'turndown';
import { save } from '@tauri-apps/plugin-dialog';
import { marked } from 'marked'
import { writeTextFile, writeFile } from '@tauri-apps/plugin-fs'
import type { Editor } from '@tiptap/vue-3'

export function useNoteExporter() {
    const $t = useToast()
    const isPrinting = ref(false);

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
                icon: 'lucide:circle-x'
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
                icon: 'lucide:circle-x'
            })
            console.error('Error exporting to Markdown:', error);
        }
    };

    const exportToPDF = async (editor: Ref<Editor | undefined>, documentTitle?: string) => {
        try {
            isPrinting.value = true;

            // 1. Create a print-specific stylesheet for the document
            const printStylesheet = document.createElement('style');
            printStylesheet.id = 'print-styles';
            printStylesheet.textContent = `
        @media print {
          /* Hide navigation and toolbars */
          #remove-during-print, 
          #app-topbar, 
          #app-sidebar, 
          .editor-toolbar,
          .floating-menu,
          button[role="button"],
          .drag-handle,
          .nuxt-icon, 
          .nuxt-ui-dropdown,
          nav, 
          aside,
          footer {
            display: none !important;
          }
          
          /* Focus on content */
          body, html {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            background: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Content container */
          .tiptap {
            padding: 0 !important;
            margin: 0 !important;
            height: auto !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            background: none !important;
          }
          
          /* Typography improvements */
          .prose, .tiptap {
            font-size: 12pt !important;
            line-height: 1.5 !important;
          }
          
          h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid;
            page-break-inside: avoid;
          }
          img {
            page-break-inside: avoid;
            max-width: 100% !important;
          }
          ul, ol {
            page-break-inside: avoid;
          }
          a[href^="http"]:after {
            content: " (" attr(href) ")";
            font-size: 0.8em;
            color: #6b7280;
          }
          
          /* Ensure wiki links print well */
          .wiki-link {
            color: #1a73e8 !important;
            text-decoration: underline !important;
            font-weight: 500 !important;
            break-inside: avoid !important;
          }
          
          .wiki-link--invalid {
            color: #e06c00 !important;
            border-bottom: 1px dashed #e06c00 !important;
          }
          
          /* Code blocks */
          pre, code {
            white-space: pre-wrap !important;
            word-break: break-word !important;
            border: 1px solid #e0e0e0 !important;
            background-color: #f5f5f5 !important;
            color: #24292e !important;
          }
          
          /* Tables */
          table {
            border-collapse: collapse !important;
            width: 100% !important;
            margin: 1em 0 !important;
          }
          
          th, td {
            border: 1px solid #e0e0e0 !important;
            padding: 0.5em !important;
            break-inside: avoid !important;
          }
          
          /* Images */
          img {
            max-width: 100% !important;
            height: auto !important;
          }
          
          /* Checkboxes */
          input[type="checkbox"] {
            -webkit-appearance: checkbox !important;
            appearance: checkbox !important;
            display: inline-block !important;
            width: 13px !important;
            height: 13px !important;
            margin-right: 5px !important;
            border: 1px solid #000 !important;
          }
          
          /* Set page layout */
          @page {
            padding: 10px 5px !important;
            margin: 10cm 1cm !important;
            size: A4 !important;
          }
        }
      `;
            document.head.appendChild(printStylesheet);

            // 2. Create a clone of the editor content for printing (optional)
            const printContainer = document.createElement('div');
            printContainer.id = 'print-container';
            printContainer.style.position = 'absolute';
            printContainer.style.left = '-9999px';
            printContainer.style.top = '0';
            printContainer.innerHTML = editor.value?.getHTML() || '';

            // 3. Add title to the print
            if (documentTitle) {
                document.title = documentTitle;
            }

            // 4. Wait for styles to apply
            await nextTick();

            // 5. Launch print dialog
            window.print();

            // 6. Cleanup after print dialog closes
            window.addEventListener('afterprint', () => {
                // Remove temporary elements
                if (printStylesheet) document.head.removeChild(printStylesheet);
                if (document.body.contains(printContainer)) document.body.removeChild(printContainer);
                isPrinting.value = false;

                // Show success toast
                $t.add({
                    title: 'Document exported to PDF',
                    color: 'success',
                    icon: 'lucide:check'
                });
            }, { once: true });

            // 7. Failsafe - reset state after 10 seconds if afterprint event doesn't fire
            setTimeout(() => {
                if (isPrinting.value) {
                    if (printStylesheet && document.head.contains(printStylesheet)) document.head.removeChild(printStylesheet);
                    if (printContainer && document.body.contains(printContainer)) document.body.removeChild(printContainer);
                    isPrinting.value = false;
                }
            }, 10000);
        } catch (error) {
            // Reset state in case of error
            isPrinting.value = false;

            // Clean up any temporary elements
            const tempStyle = document.getElementById('print-styles');
            if (tempStyle) document.head.removeChild(tempStyle);

            $t.add({
                title: 'An error occurred while exporting document to PDF',
                description: `${error}`,
                color: 'error',
                icon: 'lucide:circle-x'
            });
            console.error('Error exporting to PDF:', error);
        }
    };

    return { exportToMarkdown, exportToPDF };
}