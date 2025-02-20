<script setup lang="ts">
import { TreeItem, TreeRoot, TreeVirtualizer } from 'reka-ui'
import type { SlatePage } from '~/slate.types'
import { SlateModalPageRename } from '#components'

const props = defineProps<{pages: SlatePage[], currentPage: string}>()

const $slate = useSlateFile()
const slideover = useSlideover()

// Track expanded state
const expandedItems = ref<string[]>([])
const modal = useModal()

onMounted(() => {
    const path = $slate.getCurrentNestedPageDirs(props.currentPage)
    expandedItems.value = path.map(node => node.uuid)
})

const handleRename = (uuid: string, currentName: string) => {
    slideover.close()
    modal.open(SlateModalPageRename, {
        onConfirm(newName: string) {
            if (currentName.trim()) {
                $slate.renamePage(uuid, {
                    type: 'rename',
                    value: '.*', // Replace entire name
                    replaceValue: newName.trim()
                })
            }
            modal.close()
        }
    })
}

const handleDelete = (uuid: string, hasChildren: boolean) => {
    // Optional: Add confirmation dialog
    if (confirm(`Are you sure you want to delete this page${hasChildren ? ' and its children' : ''}?`)) {
        $slate.deletePage(uuid, true) // true for recursive deletion
    }
}
</script>

<template>
    <USlideover title="Document Pages" description="All of the pages in this Slate Document.">
        <template #body>
            <div class="flex items-center justify-start gap-1 mb-2">
                <UButton icon="lucide:file-plus" variant="soft" size="sm" @click="$slate.createSlatePage(useUUID())" label="New Page"/>
                <UButton icon="lucide:file-plus" variant="soft" size="sm" @click="$slate.createSlatePage(useUUID(), currentPage)" label="New Nested Page"/>
            </div>
            <USeparator class="mb-2"/>
            <TreeRoot
                :items="pages"
                v-slot="{ flattenItems }"
                class="list-none select-none w-full rounded-lg text-sm font-medium gap-1"
                :get-key="(item) => item.uuid"
                :expanded="$slate.getExpandedNodeCache().value"
            >
                <TreeItem
                    v-for="item in flattenItems"
                    v-slot="{ isExpanded, handleToggle }"
                    :key="item._id"
                    :style="{ 'padding-left': `${item.level - 1}rem` }"
                    v-bind="item.bind"
                    :class="['flex items-center rounded outline-none mb-1 gap-2']"
                    @toggle="(event) => {event.preventDefault()}"
                >
                    <UContextMenu size="sm" :items="[
                        [
                          {
                            label: 'Rename',
                            icon: 'lucide:edit-2',
                            onSelect: () => handleRename(item.value.uuid, item.value.name)
                          },
                          {
                            label: 'Delete',
                            icon: 'lucide:trash-2',
                            color: 'error',
                            onSelect: () => handleDelete(item.value.uuid, (item.value.children?.length || 0) > 0)
                          }
                        ],
                        [
                          {
                            label: 'New Child Page',
                            icon: 'lucide:file-plus',
                            onSelect: () => $slate.createSlatePage(useUUID(), item.value.uuid)
                          }
                        ]
                      ]">
                        <UButton
                            class="justify-start w-full z-10"
                            :variant="currentPage == item.value.uuid ? 'solid' : 'ghost'"
                            :icon="item.value.icon"
                            :label="item.value.name"
                            size="sm"
                            @click="() => {
                            navigateTo(`/document/${item.value.uuid}`)
                            slideover.close()
                        }"
                        />
                        <template v-if="(item.value.children?.length || 0) > 0">
                            <UButton
                                size="sm"
                                variant="subtle"
                                class="z-10" :icon="isExpanded ? 'lucide:folder-open': 'lucide:folder'"
                                @click="() => {
                                    if (isExpanded) {
                                        $slate.uncacheExpandedNode(item.value.uuid)
                                    } else {
                                        $slate.cacheExpandedNode(item.value.uuid)
                                    }
                                    handleToggle()
                                }"/>
                        </template>
                    </UContextMenu>
                </TreeItem>
            </TreeRoot>
        </template>
    </USlideover>
</template>

<style scoped>

</style>