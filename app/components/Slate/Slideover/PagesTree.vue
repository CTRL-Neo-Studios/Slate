<script setup lang="ts">
import { TreeItem, TreeRoot, TreeVirtualizer } from 'reka-ui'
import type { SlatePage } from '~/slate.types'
import { SlateModalPageRename, SlateModalSelectIcon, SlateModalWarning } from '#components'

const props = defineProps<{pages: SlatePage[], currentPage: string}>()

const $slate = useSlateFile()
const $slateCommon = useSlateCommon()
const slideover = useSlideover()

// Track expanded state
const expandedItems = ref<string[]>([])
const modal = useModal()
const $t = useToast()

onMounted(() => {
    const path = $slate.getCurrentNestedPageDirs(props.currentPage)
    expandedItems.value = path.map(node => node.uuid)
})

const handleRename = (uuid: string, currentName: string) => {
    $slateCommon.renamePage(uuid, currentName)
    slideover.close()
}

const handleDelete = (uuid: string, recursive: boolean) => {
    $slateCommon.deletePage(uuid, recursive)
    slideover.close()
}

const handleCreatePage = async (mode: 'root' | 'current' | 'under', targetPageUUID: string) => {
    await $slateCommon.createPage(mode, targetPageUUID)
    await slideover.close()
}

const handleChangeIcon = (uuid: string) => {
    $slateCommon.changeIcon(uuid)
    slideover.close()
}
</script>

<template>
    <USlideover title="Document Pages" description="All of the pages in this Slate Document.">
        <template #body>
            <div class="flex items-center justify-start gap-1 mb-2">
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