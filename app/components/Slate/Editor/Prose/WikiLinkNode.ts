// extensions/WikiLinkNode.ts - Updated version

import { mergeAttributes, Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import WikiLink from '~/components/Slate/Editor/Prose/WikiLink.vue'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export const WIKILINK_REGEX = /\[\[(.*?)(?:\|(.*?))?\]\]/g

export default Node.create({
    name: 'wikiLink',
    group: 'inline',
    inline: true,
    selectable: true,
    atom: true,

    addAttributes() {
        return {
            // Store the referenced page's UUID
            pageId: {
                default: null,
            },
            // The text to display (optional, if different from the page title)
            displayText: {
                default: null,
            },
            // Track if the linked page exists
            isValid: {
                default: true,
            }
        }
    },

    parseHTML() {
        return [
            {
                tag: 'span[data-type="wiki-link"]',
                getAttrs: (element) => {
                    if (typeof element === 'string') return {}

                    return {
                        pageId: element.getAttribute('data-page-id'),
                        displayText: element.getAttribute('data-display-text'),
                        isValid: element.getAttribute('data-is-valid') !== 'false'
                    }
                }
            }
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'span',
            mergeAttributes(
                { 'data-type': 'wiki-link' },
                { 'data-page-id': HTMLAttributes.pageId },
                { 'data-display-text': HTMLAttributes.displayText },
                { 'data-is-valid': HTMLAttributes.isValid.toString() }
            ),
            HTMLAttributes.displayText || HTMLAttributes.pageId || ''
        ]
    },

    addNodeView() {
        return VueNodeViewRenderer(WikiLink)
    },

    //@ts-ignore
    addCommands() {
        return {
            //@ts-ignore
            setWikiLink: (attributes) => ({ commands }) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: attributes
                })
            }
        }
    },

    addProseMirrorPlugins() {
        const wikiLinkRegex = WIKILINK_REGEX

        return [
            new Plugin({
                key: new PluginKey('wikiLinkInputDetection'),
                props: {
                    handleTextInput(view, from, to, text) {
                        try {
                            if (text !== ']' || from !== to) {
                                return false
                            }

                            // Check if this completes a wiki link pattern
                            const $pos = view.state.doc.resolve(from)
                            const textBefore = view.state.doc.textBetween(
                                Math.max(0, $pos.pos - 100),
                                $pos.pos
                            ) + text

                            // Check if we just completed a [[...]] pattern
                            const match = textBefore.match(/\[\[(.*?)(?:\|(.*?))?\]\]$/)

                            if (match) {
                                const startPos = from - (match[0].length - 1)

                                // Extract page title and optional display text
                                const pageTitle = match[1]?.trim()
                                const displayText = match[2]?.trim() || pageTitle

                                // Skip if we don't have a valid page title
                                if (!pageTitle) {
                                    return false
                                }

                                // First we need to delete the manually typed link
                                const tr = view.state.tr.delete(startPos, from + 1)
                                view.dispatch(tr)

                                // Now look up if there's a page that matches this title
                                try {
                                    const slateFile = useSlateFile()
                                    let matchedPage = null

                                    // Only proceed if we can access page data
                                    if (slateFile && typeof slateFile.getCachedFlattenedPages === 'function') {
                                        // Search pages for matching title
                                        const allPages = slateFile.getCachedFlattenedPages()

                                        if (Array.isArray(allPages)) {
                                            for (const page of allPages) {
                                                if (page && page.name && page.name.toLowerCase() === pageTitle.toLowerCase()) {
                                                    matchedPage = page
                                                    break
                                                }
                                            }
                                        }

                                        // Create the wiki link node
                                        if (matchedPage) {
                                            // Insert the wiki link node
                                            view.dispatch(
                                                view.state.tr.replaceWith(
                                                    startPos,
                                                    startPos,
                                                    view.state.schema.nodes.wikiLink.create({
                                                        pageId: matchedPage.uuid,
                                                        displayText: displayText !== pageTitle ? displayText : null,
                                                        isValid: true
                                                    })
                                                )
                                            )
                                        } else {
                                            // Insert as invalid link
                                            view.dispatch(
                                                view.state.tr.replaceWith(
                                                    startPos,
                                                    startPos,
                                                    view.state.schema.nodes.wikiLink.create({
                                                        pageId: pageTitle, // Use the title as temporary ID
                                                        displayText: displayText !== pageTitle ? displayText : null,
                                                        isValid: false
                                                    })
                                                )
                                            )
                                        }
                                    } else {
                                        // If we can't get page data, just create a basic invalid link
                                        view.dispatch(
                                            view.state.tr.replaceWith(
                                                startPos,
                                                startPos,
                                                view.state.schema.nodes.wikiLink.create({
                                                    pageId: pageTitle,
                                                    displayText: displayText !== pageTitle ? displayText : null,
                                                    isValid: false
                                                })
                                            )
                                        )
                                    }
                                } catch (err) {
                                    console.error('Error processing wiki link creation:', err)
                                    // In case of any error, just leave the text as is
                                    return false
                                }

                                return true
                            }
                        } catch (err) {
                            console.error('Error in wiki link text input handler:', err)
                        }

                        return false
                    }
                }
            }),

            // Plugin for highlighting wiki link syntax while typing
            new Plugin({
                key: new PluginKey('wikiLinkSyntaxHighlighting'),
                state: {
                    init() {
                        return DecorationSet.empty
                    },
                    apply(tr, set) {
                        try {
                            // Adjust decoration positions
                            set = set.map(tr.mapping, tr.doc)

                            // Don't scan if not needed
                            if (!tr.docChanged) {
                                return set
                            }

                            const decorations: Decoration[] = []
                            const regex = /\[\[(.*?)(?:\|.*?)?\]\]?/g

                            const { doc } = tr

                            // Find incomplete wiki links in the document
                            doc.descendants((node, position) => {
                                if (!node.isText) return

                                const { text } = node
                                if (!text) return

                                let match
                                while ((match = regex.exec(text)) !== null) {
                                    // Only add decoration for incomplete wiki links
                                    const isComplete = match[0].endsWith(']]')
                                    if (!isComplete) {
                                        const start = position + match.index
                                        const end = start + match[0].length

                                        decorations.push(
                                            Decoration.inline(start, end, {
                                                class: 'wiki-link-syntax'
                                            })
                                        )
                                    }
                                }
                            })

                            // Return new decoration set
                            return DecorationSet.create(doc, decorations)
                        } catch (err) {
                            console.error('Error in wiki link highlighting:', err)
                            return set
                        }
                    }
                },
                props: {
                    decorations(state) {
                        return this.getState(state)
                    }
                }
            })
        ]
    }
})
