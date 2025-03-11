// extensions/CalloutNode.ts
import { mergeAttributes, Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import Callout from '~/components/Slate/Editor/Prose/Callout.vue'

export default Node.create({
    name: 'callout',
    group: 'block',

    content: 'block+',
    draggable: true,

    addAttributes() {
        return {
            title: {
                default: 'Note'
            },
            color: {
                default: 'primary'
            },
            icon: {
                default: 'lucide:info'
            },
            variant: {
                default: 'solid'
            }
        }
    },

    parseHTML() {
        return [{
            tag: 'div[data-type="callout"]',
            getAttrs: element => ({
                title: element.getAttribute('title'),
                color: element.getAttribute('color'),
                icon: element.getAttribute('icon'),
                variant: element.getAttribute('variant')
            })
        }]
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, {
            'data-type': 'callout',
        }), 0]
    },

    addNodeView() {
        //@ts-ignore
        return VueNodeViewRenderer(Callout)
    },

    //@ts-ignore
    addCommands() {
        return {
            //@ts-ignore this is fucking annoying
            setCallout: (options: any) => ({ commands }) => {
                // console.log('Setting alert with options:', options) // Debug log
                return commands.insertContent({
                    type: this.name,
                    attrs: {
                        title: options.title || 'Note',
                        color: options.color || 'primary',
                        icon: options.icon || 'lucide:info',
                        variant: options.variant || 'solid',
                    },
                    content: [{
                        type: 'paragraph',
                        content: [{
                            type: 'text',
                            text: 'text'
                        }]
                    }]
                })
            },
        }
    }
})