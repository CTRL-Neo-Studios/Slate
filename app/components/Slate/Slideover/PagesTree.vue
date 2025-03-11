<script setup lang="ts">
import { TreeItem, TreeRoot, TreeVirtualizer } from 'reka-ui'
import type { SlatePage } from '~/slate.types'

const props = defineProps<{pages: SlatePage[], currentPage: string}>()
const emit = defineEmits(['close'])

const $slate = useSlateFile()
const $slateCommon = useSlateCommon()

// Track expanded state
const expandedItems = ref<string[]>([])
const $t = useToast()

function remap() {
    const path = $slate.getCurrentNestedPageDirs(props.currentPage)
    expandedItems.value = path.map(node => node.uuid)
}
onMounted(() => {
    remap()
    $slate.subscribeOnPageReindex(remap)
})

const handleRename = (uuid: string, currentName: string) => {
    $slateCommon.renamePage(uuid, currentName)
}

const handleDelete = (uuid: string, recursive: boolean) => {
    $slateCommon.deletePage(uuid, recursive)
}

const handleCreatePage = async (mode: 'root' | 'current' | 'under', targetPageUUID: string) => {
    await $slateCommon.createPage(mode, targetPageUUID)
}

const handleChangeIcon = (uuid: string) => {
    $slateCommon.changeIcon(uuid)
}

function closeSlideover() {
    emit('close', false)
}
</script>

<template>
    <USlideover title="Document Pages" description="All of the pages in this Slate Document.">
        <template #close>
            <div class="flex-grow"/>
            <UDropdownMenu :items="[
                    {
                        label: 'In Document',
                        onSelect() {
                            handleCreatePage('root', currentPage)
                        }
                    },
                    {
                        label: 'At Same Level',
                        disabled: $slate.getPageParent(currentPage)?.uuid == null,
                        onSelect() {
                            handleCreatePage('current', currentPage)
                        }
                    },
                    {
                        label: 'Under Current Page',
                        onSelect() {
                            handleCreatePage('under', currentPage)
                        }
                    },
                ]">
                <UButton icon="lucide:file-plus" variant="soft" size="sm" label="New Page..."/>
            </UDropdownMenu>
        </template>
        <template #body>
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
                            icon: 'lucide:pen-line',
                            onSelect: () => {
                                handleRename(item.value.uuid, item.value.name)
                            }
                          },
                          {
                            label: 'Change Icon',
                            icon: 'lucide:pen-line',
                            onSelect: () => {
                                handleChangeIcon(item.value.uuid)
                            }
                          },
                          {
                            label: 'Delete',
                            icon: 'lucide:trash-2',
                            color: 'error',
                            onSelect: () => {
                                handleDelete(item.value.uuid, true)
                            }
                          }
                        ],
                        [
                          {
                            label: 'New Child Page',
                            icon: 'lucide:file-plus',
                            onSelect: () => {
                                handleCreatePage('under', item.value.uuid)
                            }
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
                                closeSlideover()
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