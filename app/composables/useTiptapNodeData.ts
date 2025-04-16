import type { Editor } from '@tiptap/vue-3'

export function useTiptapNodeData() {
    const currentNode = useState<Node | null>('tiptap.currentNode', () => null)
    const nodePosition = useState<number>('tiptap.nodePos', () => 0)

    function callback(data: {
        editor: Editor;
        node: Node | null;
        pos: number;
    }) {
        currentNode.value = data.node
        nodePosition.value = data.pos
    }

    return {
        callback,
        currentNode,
        currentNodePosition: nodePosition
    }
}