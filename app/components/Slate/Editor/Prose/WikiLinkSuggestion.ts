// extensions/WikiLinkSuggestion.ts - Improved version
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { VueRenderer } from '@tiptap/vue-3'
import WikiLinkSuggestion from '~/components/Slate/Editor/Prose/WikiLinkSuggestion.vue'
import tippy from 'tippy.js'

export default Extension.create({
    name: 'wikiLinkSuggestion',

    addProseMirrorPlugins() {
        const slateFile = useSlateFile()
        const pluginKey = new PluginKey('wikiLinkSuggestion')

        // Store a reference to the editor
        const editor = this.editor

        return [
            new Plugin({
                key: pluginKey,

                state: {
                    init() {
                        return {
                            active: false,
                            range: null,
                            query: null,
                            $position: null,
                        }
                    },

                    apply(tr, prev) {
                        const { selection } = tr
                        const next = { ...prev }

                        // Check if we should close the suggestion menu on text deletion
                        if (tr.docChanged && prev.active) {
                            const newTextBefore = selection.$from.parent.textBetween(
                                Math.max(0, selection.$from.parentOffset - 50),
                                selection.$from.parentOffset,
                                ''
                            )

                            // If [[ pattern is no longer there, deactivate
                            if (!newTextBefore.match(/\[\[([^|\]]*)?$/)) {
                                next.active = false
                            }
                        }

                        // Check for new [[ pattern
                        if (selection.empty) {
                            const $position = selection.$from
                            const textBefore = $position.parent.textBetween(
                                Math.max(0, $position.parentOffset - 50),
                                $position.parentOffset,
                                ''
                            )

                            const regex = /\[\[([^|\]]*)?$/
                            const match = textBefore.match(regex)

                            if (match) {
                                next.active = true
                                next.query = match[1] || ''
                                next.range = {
                                    from: $position.pos - (match[0].length),
                                    to: $position.pos,
                                }
                                next.$position = $position
                            }
                        }

                        return next
                    },
                },

                props: {
                    // Handle keyboard events specifically related to wikiLinks
                    handleKeyDown(view, event) {
                        const state = pluginKey.getState(view.state)

                        // Only handle key events when suggestion is active
                        if (!state.active) {
                            return false
                        }

                        // Prevent arrow up/down from moving cursor when suggestions are open
                        if (event.key === 'ArrowDown' || event.key === 'ArrowUp' ||
                            event.key === 'Enter' || event.key === 'Tab' || event.key === 'Escape') {
                            return true  // Tell PM we handled this key
                        }

                        return false  // Let other handlers deal with the key
                    }
                },

                view() {
                    let component = null
                    let tippyInstance = null

                    return {
                        update(view, prevState) {
                            const state = pluginKey.getState(view.state)

                            // Check if we need to destroy the component
                            if (!state.active) {
                                if (component || tippyInstance) {
                                    if (tippyInstance) {
                                        tippyInstance.destroy()
                                        tippyInstance = null
                                    }

                                    if (component) {
                                        try {
                                            component.destroy()
                                        } catch (e) {
                                            console.error('Error destroying component:', e)
                                        }
                                        component = null
                                    }
                                }
                                return
                            }

                            // Skip update if state hasn't changed
                            if (component && prevState === view.state) {
                                return
                            }

                            const searchQuery = state.query?.toLowerCase() || ''

                            // Get all pages for suggestions
                            let pages = []
                            try {
                                pages = slateFile.getCachedFlattenedPages ?
                                    slateFile.getCachedFlattenedPages() :
                                    Array.from(slateFile.pageMap.value.values() || [])
                            } catch (err) {
                                console.error('Error getting pages:', err)
                            }

                            // Filter pages based on search query
                            const filteredPages = searchQuery
                                ? pages.filter(page => (page.name || 'Untitled').toLowerCase().includes(searchQuery))
                                : pages

                            // Sort pages with enhanced ranking
                            const sortedPages = filteredPages.sort((a, b) => {
                                const aName = (a.name || 'Untitled').toLowerCase()
                                const bName = (b.name || 'Untitled').toLowerCase()

                                // Exact matches first
                                if (aName === searchQuery && bName !== searchQuery) return -1
                                if (bName === searchQuery && aName !== searchQuery) return 1

                                // Then matches starting with the query
                                if (aName.startsWith(searchQuery) && !bName.startsWith(searchQuery)) return -1
                                if (bName.startsWith(searchQuery) && !aName.startsWith(searchQuery)) return 1

                                // Then word boundary matches (after spaces or special chars)
                                const aHasBoundary = /(\s|^|\W)/.test(aName.substring(Math.max(0, aName.indexOf(searchQuery) - 1), aName.indexOf(searchQuery)))
                                const bHasBoundary = /(\s|^|\W)/.test(bName.substring(Math.max(0, bName.indexOf(searchQuery) - 1), bName.indexOf(searchQuery)))

                                if (aHasBoundary && !bHasBoundary) return -1
                                if (bHasBoundary && !aHasBoundary) return 1

                                // Then by path length (shorter paths first for root-level items)
                                try {
                                    const aPathLength = slateFile.getCurrentNestedPageDirs ? slateFile.getCurrentNestedPageDirs(a.uuid).length : 0
                                    const bPathLength = slateFile.getCurrentNestedPageDirs ? slateFile.getCurrentNestedPageDirs(b.uuid).length : 0

                                    if (aPathLength !== bPathLength) {
                                        return aPathLength - bPathLength
                                    }
                                } catch (err) {
                                    console.error('Error comparing page paths:', err)
                                }

                                // Finally alphabetically
                                return aName.localeCompare(bName)
                            })

                            // Limit results for performance, but allow more (up to 20)
                            const limitedResults = sortedPages.slice(0, 20)

                            // Update existing component if available
                            if (component) {
                                component.updateProps({
                                    items: limitedResults,
                                })
                            } else {
                                // Create a handler to safely destroy the component
                                const destroyComponent = () => {
                                    if (tippyInstance) {
                                        tippyInstance.destroy()
                                        tippyInstance = null
                                    }

                                    if (component) {
                                        try {
                                            component.destroy()
                                        } catch (e) {
                                            console.error('Error destroying component:', e)
                                        }
                                        component = null
                                    }
                                }

                                // Create new component
                                component = new VueRenderer(WikiLinkSuggestion, {
                                    editor,
                                    props: {
                                        items: limitedResults,
                                        command: ({ id, title }) => {
                                            if (state.range) {
                                                view.dispatch(
                                                    view.state.tr
                                                        .delete(state.range.from, state.range.to)
                                                        .replaceWith(
                                                            state.range.from,
                                                            state.range.from,
                                                            view.state.schema.nodes.wikiLink.create({
                                                                pageId: id,
                                                                displayText: null,
                                                                isValid: true
                                                            })
                                                        )
                                                )

                                                view.focus()
                                                destroyComponent()
                                            }
                                        },
                                        range: state.range,
                                        editor,
                                    },
                                    // Correctly handle "close" event
                                    onCreate: ({ on }) => {
                                        if (typeof on === 'function') {
                                            on('close', destroyComponent)
                                        }
                                    }
                                })

                                // Use tippy.js for positioning
                                const coords = view.coordsAtPos(state.$position.pos)

                                tippyInstance = tippy('body', {
                                    content: component.element,
                                    showOnCreate: true,
                                    trigger: 'manual',
                                    interactive: true, // Allow interaction with the menu
                                    appendTo: () => document.body,
                                    placement: 'bottom-start',
                                    getReferenceClientRect: () => ({
                                        top: coords.top,
                                        bottom: coords.bottom,
                                        left: coords.left,
                                        right: coords.left,
                                        width: 0,
                                        height: coords.bottom - coords.top,
                                    }),
                                })[0]
                            }
                        },

                        destroy() {
                            if (tippyInstance) {
                                tippyInstance.destroy()
                            }

                            if (component) {
                                try {
                                    component.destroy()
                                } catch (e) {
                                    console.error('Error destroying component:', e)
                                }
                            }
                        }
                    }
                }
            })
        ]
    }
})
