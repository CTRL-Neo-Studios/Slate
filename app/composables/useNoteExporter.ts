import TurndownService from 'turndown';
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile, writeFile } from '@tauri-apps/plugin-fs'
import htmlpdf, { type CreateOptions } from 'html-pdf'

export function useNoteExporter() {
    const exportToMarkdown = async (contentHtml: any, metaData: any) => {
        try {
            const turndownService = new TurndownService();

            // Convert HTML to Markdown
            const markdownContent = turndownService.turndown(contentHtml);

            // Optionally add metadata at the top (e.g., YAML frontmatter)
            const yamlFrontmatter = `---
title: ${metaData.title || 'Untitled'}
tags: ${metaData.tags ? metaData.tags.join(', ') : ''}
---
`;

            const fullMarkdown = yamlFrontmatter + markdownContent;



            const filePath = await save({
                filters: [{
                    name: 'Markdown',
                    extensions: ['md']
                }]
            });

            if (filePath) {
                await writeTextFile(filePath, fullMarkdown);
                console.log('Markdown exported successfully:', filePath);
            }
        } catch (error) {
            console.error('Error exporting to Markdown:', error);
        }
    };

    const exportToPDF = async (contentHtml: any) => {
        try {

            // Generate PDF from HTML
            const pdfOptions: CreateOptions = { format: 'A4' }; // Customize PDF options
            const pdfBuffer = await new Promise((resolve, reject) => {
                htmlpdf.create(contentHtml, pdfOptions).toBuffer((err, buffer) => {
                    if (err) reject(err);
                    else resolve(buffer);
                });
            });

            // Save the PDF file
            const filePath = await save({
                filters: [{
                    name: 'PDF',
                    extensions: ['pdf']
                }]
            });

            if (filePath) {
                await writeFile(filePath, pdfBuffer as any);
                console.log('PDF exported successfully:', filePath);
            }
        } catch (error) {
            console.error('Error exporting to PDF:', error);
        }
    };

    return { exportToMarkdown, exportToPDF };
}