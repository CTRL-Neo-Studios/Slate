<script setup lang="ts">
import { VNetworkGraph } from "v-network-graph"
import * as vNG from "v-network-graph"
import {
    ForceLayout,
    type ForceNodeDatum,
    type ForceEdgeDatum,
} from "v-network-graph/lib/force-layout"
import type { PossiblyRef } from '~/utility.types'
const $slate = useSlateFile()
const $route = useRoute()
const routePageId = computed(() => $route.params.pageId as any as string)
const props = defineProps<{currentPage?: string}>()

const data = reactive($slate.getPagesAsNodesAndEdges($slate.getFileName(), routePageId))
function refreshGraphNodes(id: PossiblyRef<string>) {
    data.nodes = $slate.getPagesAsNodesAndEdges($slate.getFileName(), id).nodes
    data.edges = $slate.getPagesAsNodesAndEdges($slate.getFileName(), id).edges
}
function smartRefreshNodes() {
    refreshGraphNodes(routePageId)
}
watch(routePageId, (newId) => {
    refreshGraphNodes(newId)
})

const configs = reactive(
    vNG.defineConfigs({
        view: {
            layoutHandler: new ForceLayout({
                positionFixedByDrag: false,
                positionFixedByClickWithAltKey: true,
                createSimulation: (d3, nodes, edges) => {
                    // d3-force parameters
                    const forceLink = d3.forceLink<ForceNodeDatum, ForceEdgeDatum>(edges).id((d: any) => d.id)
                    return d3
                        .forceSimulation(nodes)
                        .force("edge", forceLink.distance(40).strength(0.5))
                        .force("charge", d3.forceManyBody().strength(-800))
                        .force("center", d3.forceCenter().strength(0.05))
                        .alphaMin(0.001)
                }
            }),
        },
        node: {
            normal: {
                type: "circle",
                radius: node => node.size || 1, // Use the value of each node object
            },
            hover: {
                radius: node => (node.size || 1) + 2,
            },
            selectable: 1,
            label: {
                visible: node => !!node.label,
            },
            focusring: {
                color: "darkgray",
            },
        },
        edge: {
            normal: {
                width: edge => edge.width, // Use the value of each edge object
                color: edge => edge.color,
                dasharray: edge => (edge.dashed ? "4" : "0"),
            },
        },
    })
)

const emit = defineEmits<{ close: [boolean] }>()
function closeModal() {
    emit('close', false)
}

const selectedNodes = ref<string[]>([])
const selectedNode = computed(() => selectedNodes.value[0] || '')
const hasNodesSelected = computed(() => selectedNodes.value.length <= 0 || selectedNodes.value[0] == 'root_node')

function toNodePage() {
    if (selectedNodes.value[0] == 'root_node' || selectedNodes.value[0] == '')
        return
    navigateTo(`/document/${selectedNodes.value[0] || ''}`)
    // closeModal()
}

const $slateCommon = useSlateCommon()

const handleRename = () => {
    $slateCommon.renamePage(selectedNode, $slate.getCurrentSlatePage(selectedNode)?.name || '', smartRefreshNodes)
}

const handleDelete = (uuid: string, recursive: boolean) => {
    $slateCommon.deletePage(uuid, recursive)
}

const handleCreatePage = async (mode: 'root' | 'current' | 'under') => {
    await $slateCommon.createPage(mode, selectedNode)
}
</script>

<template>
    <UModal :title="`Nodes View of ${$slate.getFileName()}`" description="The structured nodes view of the current document." fullscreen>
        <template #body>
            <div class="select-none w-full h-full">
                <v-network-graph class="w-full h-full select-none" :nodes="data.nodes" :edges="data.edges" :configs="configs" v-model:selected-nodes="selectedNodes">
                    <template #override-node="{ nodeId, scale, config, ...slotProps }">
                        <circle
                            :r="config.radius * scale"
                            v-bind="slotProps"
                            :style="{
                                fill: nodeId === 'root_node'
                                    ? 'var(--ui-color-success-500)'
                                    : nodeId === routePageId
                                    ? 'var(--ui-color-info-500)'
                                    : 'var(--ui-color-primary-500)',
                                stroke: selectedNodes.includes(nodeId)
                                    ? 'var(--vcolor-primary-400)'
                                    : 'none',
                                strokeWidth: selectedNodes.includes(nodeId) ? '2px' : '0'
                            }"
                        />
                    </template>
                </v-network-graph>
            </div>
        </template>
        <template #footer>
            <div class="flex w-full justify-end items-center gap-2">
                <UButton label="New Child Page" variant="soft" :disabled="hasNodesSelected" @click="handleCreatePage('under')"/>
                <UButton label="Rename" variant="soft" :disabled="hasNodesSelected" @click="handleRename"/>
                <UButton label="Open" variant="soft" :disabled="hasNodesSelected" @click="toNodePage"/>
            </div>
        </template>
    </UModal>
</template>

<style>
@reference "~/assets/css/main.css";
.v-ng-text {
    @apply fill-primary-800 dark:fill-primary-50;
}
</style>