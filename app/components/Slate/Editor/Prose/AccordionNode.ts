// extensions/AccordionNode.ts
import { mergeAttributes, Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import Accordion from '~/components/Slate/Editor/Prose/Accordion.vue'

export default Node.create({
    name: 'accordion',
    group: 'block',
    content: 'block+',
    draggable: true,
    isolating: true,

    addAttributes() {
        return {
            title: {
                default: 'Collapsible Section'
            },
            icon: {
                default: 'lucide:info'
            },
            isOpen: {
                default: true,
                parseHTML: element => element.getAttribute('data-is-open') === 'true',
                renderHTML: attributes => ({
                    'data-is-open': attributes.isOpen
                })
            }
        }
    },

    parseHTML() {
        return [{
            tag: 'div[data-type="accordion"]'
        }]
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(
            { 'data-type': 'accordion' },
            HTMLAttributes
        ), 0]
    },

    addNodeView() {
        //@ts-ignore
        return VueNodeViewRenderer(Accordion)
    },

    //@ts-ignore
    addCommands() {
        return {
            //@ts-ignore this is very annoying
            setAccordion: (options: any) => ({ commands }) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: {
                        title: options.title || 'Collapsible',
                        icon: options.icon || 'lucide:info',
                        isOpen: options.isOpen
                    },
                    content: [{
                        type: 'paragraph',
                        content: [{
                            type: 'text',
                            text: 'text'
                        }]
                    }]
                })
            }
        }
    }
})