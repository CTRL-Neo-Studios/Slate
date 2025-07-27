import TurndownService from 'turndown';
import { save } from '@tauri-apps/plugin-dialog';
import { marked } from 'marked';
import { writeTextFile, writeFile } from '@tauri-apps/plugin-fs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import type { Editor } from '@tiptap/vue-3';

export function useNoteExporter() {
    const $t = useToast();
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
                    title: 'Exported Document to Plain Text!',
                    description: `Exported to ${filePath}`,
                    color: 'success',
                    icon: 'lucide:check'
                });
                console.log('Plain text exported successfully:', filePath);
            }
        } catch (error) {
            $t.add({
                title: 'An error occurred while exporting document to plain text.',
                description: `${error}`,
                color: 'error',
                icon: 'lucide:circle-x'
            });
            console.error('Error exporting to plain text:', error);
        }
    };

    const exportToMarkdown = async (editor: Ref<Editor | undefined>) => {
        try {
            const turndownService = new TurndownService();
            const fullMarkdown = turndownService.turndown(editor.value?.getHTML() || '');

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
                });
                console.log('Markdown exported successfully:', filePath);
            }
        } catch (error) {
            $t.add({
                title: 'An error occurred while exporting document to markdown.',
                description: `${error}`,
                color: 'error',
                icon: 'lucide:circle-x'
            });
            console.error('Error exporting to Markdown:', error);
        }
    };

    /**
     * Creates a snapshot of the element for PDF export
     * This approach captures the rendered page exactly as it appears
     */
    async function captureElementAsImage(elementRef: Ref<HTMLElement>) {
        try {
            const element = unref(elementRef);

            // Create a temporary wrapper with proper padding
            const wrapper = document.createElement('div');
            wrapper.style.padding = '40px';
            wrapper.style.background = 'white';
            wrapper.style.maxWidth = '800px';
            wrapper.style.margin = '0 auto';

            // Clone the element to avoid modifying the original
            const clone = element.cloneNode(true) as HTMLElement;

            // Remove any drag handles or UI elements we don't want in the PDF
            const dragHandles = clone.querySelectorAll('.drag-handle');
            dragHandles.forEach(handle => handle.parentNode?.removeChild(handle));

            // Add the clone to the wrapper
            wrapper.appendChild(clone);

            // Hide the wrapper offscreen and add it to the document temporarily
            wrapper.style.position = 'absolute';
            wrapper.style.left = '-9999px';
            wrapper.style.top = '0';
            document.body.appendChild(wrapper);

            // Use html2canvas to capture the rendered element
            const canvas = await html2canvas(wrapper, {
                scale: 2, // Higher quality
                useCORS: true,
                allowTaint: true,
                logging: false,
                backgroundColor: '#ffffff',
                // Ensure fonts are properly rendered
                onclone: (document) => {
                    // We can inject any required styles here if needed
                    const styleEl = document.createElement('style');
                    styleEl.textContent = `
                        * {
                            font-family: 'Inter', 'Noto Sans Simplified Chinese', sans-serif !important;
                        }
                        
                        .tiptap {
                            padding: 20px !important;
                            height: auto !important;
                        }
                    `;
                    document.head.appendChild(styleEl);
                }
            });

            // Remove the temporary element
            document.body.removeChild(wrapper);

            return canvas;
        } catch (error) {
            console.error('Error capturing element:', error);
            throw error;
        }
    }

    /**
     * Splits a canvas into multiple pages if it exceeds certain height
     */
    async function createPDFFromCanvas(canvas: HTMLCanvasElement, documentTitle: string, pageSize = 'a4') {
        // A4 dimensions in points (72 DPI)
        const a4Width = 595;
        const a4Height = 842;

        // Calculate scale to fit width while maintaining aspect ratio
        const scale = a4Width / canvas.width;
        const scaledHeight = canvas.height * scale;

        // Create PDF
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: pageSize
        });

        // If content fits on one page
        if (scaledHeight <= a4Height) {
            pdf.addImage(
                canvas.toDataURL('image/png'),
                'PNG',
                0,
                0,
                a4Width,
                scaledHeight
            );
        } else {
            // Split into multiple pages
            let remainingHeight = canvas.height;
            let currentPosition = 0;

            while (remainingHeight > 0) {
                // Height of this page's content (in canvas pixels)
                const pageContentHeight = Math.min(
                    remainingHeight,
                    canvas.width * (a4Height / a4Width)
                );

                // Create a temporary canvas for this page section
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = pageContentHeight;

                // Draw portion of original content to temp canvas
                const ctx = tempCanvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(
                        canvas,
                        0, currentPosition, canvas.width, pageContentHeight,
                        0, 0, canvas.width, pageContentHeight
                    );
                }

                // Add this section to PDF
                pdf.addImage(
                    tempCanvas.toDataURL('image/png'),
                    'PNG',
                    0,
                    0,
                    a4Width,
                    (pageContentHeight / canvas.width) * a4Width
                );

                // Move to next position
                currentPosition += pageContentHeight;
                remainingHeight -= pageContentHeight;

                // Add new page if there's more content
                if (remainingHeight > 0) {
                    pdf.addPage();
                }
            }
        }

        return pdf;
    }

    async function exportToPDF(elementRef: Ref<HTMLElement>, documentTitle = 'document.pdf') {
        isPrinting.value = true;

        try {
            // Display loading indicator
            $t.add({
                title: 'Generating PDF',
                description: 'Please wait while the document is being prepared...',
                color: 'info',
                icon: 'lucide:file'
            });

            // Step 1: Capture the element as a high-quality image
            const canvas = await captureElementAsImage(elementRef);

            // Step 2: Create PDF from the canvas
            const pdf = await createPDFFromCanvas(canvas, documentTitle);

            // Step 3: Save the PDF
            const pdfBytes = pdf.output('arraybuffer');

            const filePath = await save({
                filters: [{
                    name: 'PDF',
                    extensions: ['pdf']
                }],
                defaultPath: documentTitle
            });

            if (filePath) {
                await writeFile(filePath, new Uint8Array(pdfBytes));
                $t.add({
                    title: 'PDF Saved Successfully',
                    description: `Saved to ${filePath}`,
                    color: 'success',
                    icon: 'lucide:check'
                });
            }
        } catch (error) {
            console.error('PDF export failed:', error);
            $t.add({
                title: 'PDF Export Failed',
                description: error instanceof Error ? error.message : String(error),
                color: 'error',
                icon: 'lucide:alert-circle'
            });
        } finally {
            isPrinting.value = false;
        }
    }

    async function printPDF(editorRef: Ref<HTMLElement>) {
        isPrinting.value = true;

        try {
            // Determine if we're working with an Editor instance or an HTML element
            const editorElement = unref(editorRef)

            // Create a new window for printing
            const printWindow = window.open('', '_blank');

            if (!printWindow) {
                throw new Error('Could not open print window. Please check your popup blocker settings.');
            }

            // Get the document content
            const content = editorElement.innerHTML;

            // Get all stylesheets from the current document
            const stylesheets = Array.from(document.styleSheets)
                .map(styleSheet => {
                    try {
                        if (styleSheet.href) {
                            // For external stylesheets
                            return `<link rel="stylesheet" href="${styleSheet.href}">`;
                        } else if (styleSheet.cssRules) {
                            // For inline and internal stylesheets
                            const cssText = Array.from(styleSheet.cssRules)
                                .map(rule => rule.cssText)
                                .join('\n');
                            return `<style>${cssText}</style>`;
                        }
                    } catch (e) {
                        // CORS may prevent accessing some stylesheets
                        if (styleSheet.href) {
                            return `<link rel="stylesheet" href="${styleSheet.href}">`;
                        }
                    }
                    return '';
                })
                .filter(Boolean)
                .join('\n');

            // Create print-specific styles
            const printStyles = `
                <style>
                    @media print {
                        @page {
                            size: A4;
                            margin: 1.5cm;
                        }
                        
                        body {
                            font-family: 'Inter', 'Noto Sans Simplified Chinese', sans-serif;
                            line-height: 1.5;
                            color: #000;
                            background: white;
                        }
                        
                        .tiptap {
                            padding: 0 !important;
                            width: 100% !important;
                            max-width: none !important;
                        }
                        
                        /* Hide UI elements not needed for print */
                        .drag-handle, 
                        [data-ui-button],
                        [role="toolbar"],
                        [role="menubar"] {
                            display: none !important;
                        }
                        
                        /* Custom styles for specific components */
                        .prose, .custom-prose {
                            max-width: none !important;
                        }
                        
                        /* Ensure background colors print */
                        * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        
                        /* Fix table borders */
                        table, th, td {
                            border-collapse: collapse;
                            border: 1px solid #ddd;
                        }
                        
                        /* Ensure page breaks happen at logical places */
                        h1, h2, h3, h4, h5, h6 {
                            page-break-after: avoid;
                            page-break-inside: avoid;
                        }
                        
                        img, table, figure {
                            page-break-inside: avoid;
                        }
                        
                        ul, ol, blockquote {
                            page-break-inside: avoid;
                        }
                        
                        /* Fix colored text issue in some browsers */
                        .text-red-500, .text-blue-500, .text-green-500, .text-yellow-500,
                        .text-purple-500, .text-pink-500, .text-indigo-500 {
                            color: inherit !important;
                        }
                        
                        /* Ensure background colors in blocks print */
                        div[style*="background-color"] {
                            box-shadow: inset 0 0 0 1000px white;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                    }
                    
                    /* Non-print styles for the preview window */
                    body {
                        font-family: 'Inter', 'Noto Sans Simplified Chinese', sans-serif;
                        padding: 2rem;
                        max-width: 210mm;
                        margin: 0 auto;
                        background-color: #f8f9fa;
                    }
                    
                    .print-container {
                        background-color: white;
                        padding: 2rem;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                        min-height: 297mm;
                    }
                    
                    .print-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 1rem;
                        padding-bottom: 0.5rem;
                        border-bottom: 1px solid #e5e7eb;
                    }
                    
                    .print-btn {
                        background-color: #3b82f6;
                        color: white;
                        border: none;
                        padding: 0.5rem 1rem;
                        border-radius: 0.25rem;
                        cursor: pointer;
                        font-weight: 500;
                    }
                    
                    .print-btn:hover {
                        background-color: #2563eb;
                    }
                    
                    @media screen {
                        .print-only {
                            display: none;
                        }
                    }
                </style>
            `;

            // Write the HTML to the new window
            printWindow.document.open();
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Print Document</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    ${stylesheets}
                    ${printStyles}
                    <!-- Font imports -->
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
                </head>
                <body>
                    <div class="screen-only print-header">
                        <h1>Print Preview</h1>
                        <button class="print-btn" onclick="window.print(); return false;">Print Document</button>
                    </div>
                    <div class="print-container">
                        <div class="print-content tiptap custom-prose">
                            ${content}
                        </div>
                    </div>
                    <div class="screen-only print-header" style="margin-top: 1rem;">
                        <button class="print-btn" onclick="window.print(); return false;">Print Document</button>
                    </div>
                    <script>
                        // Auto-focus the window and add keyboard shortcut for printing
                        window.focus();
                        document.addEventListener('keydown', function(e) {
                            // Ctrl+P or Cmd+P
                            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                                e.preventDefault();
                                window.print();
                            }
                        });
                        
                        // Handle printing completion
                        window.addEventListener('afterprint', function() {
                            console.log('Printing completed or cancelled');
                        });
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();

            // Signal that we're done
            $t.add({
                title: 'Print Preview Ready',
                description: 'The print preview has been opened in a new window.',
                color: 'success',
                icon: 'lucide:printer'
            });

        } catch (error) {
            console.error('Print preparation failed:', error);
            $t.add({
                title: 'Print Preparation Failed',
                description: error instanceof Error ? error.message : String(error),
                color: 'error',
                icon: 'lucide:alert-circle'
            });
        } finally {
            isPrinting.value = false;
        }
    }

    return { exportToMarkdown, exportToPlainText, exportToPDF, printPDF };
}
