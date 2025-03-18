// extensions/CalloutNode.ts
import { mergeAttributes, Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import Card from '~/components/Slate/Editor/Prose/Card.vue'

export default Node.create({
    name: 'card',
    group: 'block',

    content: 'block+',
    draggable: true,

    addAttributes() {
        return {
            variant: {
                default: 'outline'
            }
        }
    },

    parseHTML() {
        return [{
            tag: 'div[data-type="card"]',
            getAttrs: element => ({
                variant: element.getAttribute('variant')
            })
        }]
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, {
            'data-type': 'card',
        }), 0]
    },

    addNodeView() {
        //@ts-ignore
        return VueNodeViewRenderer(Card)
    },

    //@ts-ignore
    addCommands() {
        return {
            //@ts-ignore this is fucking annoying
            setCard: (options: any) => ({ commands }) => {
                // console.log('Setting alert with options:', options) // Debug log
                return commands.insertContent({
                    type: this.name,
                    attrs: {
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