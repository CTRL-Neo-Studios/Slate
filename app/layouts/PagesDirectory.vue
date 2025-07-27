<script setup lang="ts">
import {
    ScrollAreaRoot, ScrollAreaScrollbar, ScrollAreaThumb,
    ScrollAreaViewport,
    SplitterGroup,
    SplitterPanel,
    SplitterResizeHandle,
    TreeItem,
    TreeRoot,
} from 'reka-ui'
import { useSlateSidebar } from '~/composables/useSlateSidebar'
import { useSlateCommon } from '~/composables/useSlateCommon'
import type { DropdownMenuItem } from '@nuxt/ui'
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useSlateTheme } from '~/composables/useSlateTheme'

const $route = useRoute()
const $slate = useSlateFile()
const $slateCommon = useSlateCommon()
const $sidebar = useSlateSidebar()
const sidebarRef = ref()

const breadcrumbs = computed(() => {
    let arr = $slate.getCurrentNestedPageDirsPerformant($pageId).map((i: any) => {
        return {
            slot: 'page',
            label: i.name,
            icon: i.icon,
            to: `/document/${i.uuid}`,
        }
    })
    if (arr.length > 1){
        let concat = {
            slot: 'dropdown',
            icon: 'lucide:ellipsis',
            label: '',
            children: [
                ...arr.slice(0, arr.length-1)
            ]
        }
        return [
            {
                icon: '',
                slot: 'document',
                label: $slate.getFileName(),
            },
            concat,
            arr[arr.length-1],
        ]
    }

    return [
        {
            icon: '',
            slot: 'document',
            label: $slate.getFileName(),
        },
        ...arr,
    ]
})

const $pageId = computed(() => $route.params.pageId as string || '')

// Track expanded state
const expandedItems = ref<string[]>([])
const $t = useToast()

function remap() {
    const path = $slate.getCurrentNestedPageDirs($pageId)
    expandedItems.value = path.map(node => node.uuid)
}
onMounted(() => {
    remap()
    $slate.subscribeOnPageReindex(remap)
    useSlateTheme().setToDefault()
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

$sidebar.subscribe((value: boolean) => {
    if (value)
        sidebarRef.value.expand()
    else
        sidebarRef.value.collapse()
})

const fileOpsDropdown = ref<DropdownMenuItem[][]>([
    [
        {
            label: 'Actions'
        }
    ]
])
</script>

<template>
    <div>
<!--        <div class="w-fit left-1/2 transform -translate-x-1/2 fixed top-0 h-fit z-20 print:hidden">-->
<!--            <div class="flex items-center justify-center p-2 gap-2 select-none cursor-default" data-tauri-drag-region id="remove-during-print">-->
<!--                <div class="flex items-center justify-center p-1 px-2 gap-1 rounded-lg backdrop-blur-sm z-20 w-fit border border-(&#45;&#45;ui-bg-muted) bg-(&#45;&#45;ui-bg)/75 hover:bg-(&#45;&#45;ui-bg) dark:shadow-flexoki-base-900 hover:shadow-lg hover:translate-y-[1px] duration-200 transition-all" data-tauri-drag-region>-->
<!--                    <Icon data-tauri-drag-region name="lucide:file-warning" class="size-4 bg-(&#45;&#45;ui-text-toned)" v-if="$slate.getFilePath().value == null || ''"/>-->
<!--                    <template v-else>-->
<!--                        <Icon data-tauri-drag-region name="lucide:file-clock" class="size-4 bg-(&#45;&#45;ui-text-toned) animate-pulse animate" v-if="$slate.isSavingFile().value"/>-->
<!--                        <Icon data-tauri-drag-region name="lucide:file-check" class="size-4 bg-(&#45;&#45;ui-text-toned)" v-else-if="$slate.isFileSaved().value"/>-->
<!--                        <Icon data-tauri-drag-region name="lucide:file-x" class="size-4 bg-(&#45;&#45;ui-error))" v-else/>-->
<!--                    </template>-->
<!--                    &lt;!&ndash;Ignore The Error Here... fucking typescript&ndash;&gt;-->
<!--                    <UBreadcrumb :items="breadcrumbs" class="text-sm select-none gap-1" data-tauri-drag-region>-->
<!--                        <template #document="{item}" data-tauri-drag-region>-->
<!--                            <div data-tauri-drag-region class="px-1 text-(&#45;&#45;ui-text-toned) text-sm">{{item.label}}</div>-->
<!--                        </template>-->
<!--                        <template #page="{item}" data-tauri-drag-region>-->
<!--                            <UDropdownMenu :items="[-->
<!--                                        {-->
<!--                                            label: 'Rename Page',-->
<!--                                            onSelect () {-->
<!--                                                $slateCommon.renamePage($pageId, 'Page')-->
<!--                                            }-->
<!--                                        },-->
<!--                                        {-->
<!--                                            label: 'Change Icon',-->
<!--                                            onSelect () {-->
<!--                                                $slateCommon.changeIcon($pageId)-->
<!--                                            }-->
<!--                                        }-->
<!--                                    ]">-->
<!--                                <UButton data-tauri-drag-region class="px-1" :icon="item?.icon || 'lucide:file'" size="sm" :label="item?.label || 'Untitled Page'" variant="link" />-->
<!--                            </UDropdownMenu>-->
<!--                        </template>-->
<!--                        <template #dropdown="{item}" data-tauri-drag-region>-->
<!--                            <UDropdownMenu :items="(item as any).children || []">-->
<!--                                <UButton data-tauri-drag-region class="px-1" :icon="item.icon" size="sm" variant="link" />-->
<!--                            </UDropdownMenu>-->
<!--                        </template>-->
<!--                        <template #separator data-tauri-drag-region>-->
<!--                            <div class="text-(&#45;&#45;ui-text-muted)" data-tauri-drag-region>/</div>-->
<!--                        </template>-->
<!--                    </UBreadcrumb>-->
<!--                </div>-->
<!--            </div>-->
<!--        </div>-->
        <SplitterGroup auto-save-id="slate.ui.group1.root.autosave" class="h-screen max-h-screen" id="slate.ui.group1.root" direction="horizontal">
            <SplitterPanel
                id="slate.ui.group1.panel.sidebar"
                class="bg-(--ui-bg-muted) max-h-screen h-screen bottom-0 top-0"
                :min-size="10"
                :max-size="30"
                collapsible
                :collapsed-size="0"
                :default-size="unref($sidebar.collapsed) ? 0 : 15"
                :on-collapse="() => { $sidebar.onCallback(true) }"
                :on-expand="() => { $sidebar.onCallback(false) }"
                ref="sidebarRef"
            >
                <div class="flex flex-col gap-2 justify-start items-start top-0 bottom-0 relative right-0 left-0 h-full">
                    <div class="w-full flex flex-col items-start" data-tauri-drag-region>
                        <div class="h-10"/>
                    </div>
                    <ScrollAreaRoot class="px-2 w-full flex-grow select-none">
                        <ScrollAreaViewport class="w-full">
                            <TreeRoot
                                :items="$slate.getCurrentSlateDoc().value?.pages"
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
                                      ]"
                                    >
                                        <UButton
                                            class="justify-start w-full z-10"
                                            :variant="$pageId == item.value.uuid ? 'soft' : 'ghost'"
                                            :icon="item.value.icon"
                                            :label="item.value.name"
                                            size="sm"
                                            @click="() => {
                                                $slateCommon.toPage(item.value.uuid)
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
                        </ScrollAreaViewport>
                        <ScrollAreaScrollbar>
                            <ScrollAreaThumb/>
                        </ScrollAreaScrollbar>
                    </ScrollAreaRoot>
                    <div class="w-full flex items-center justify-center p-1 shrink">
                        <UDropdownMenu :items="fileOpsDropdown">
                            <UButton variant="ghost" class="w-full justify-between" size="sm" trailing-icon="lucide:circle-ellipsis" :label="$slate.getFileName()"/>
                        </UDropdownMenu>
                    </div>
                </div>
            </SplitterPanel>
            <SplitterResizeHandle id="slate.ui.group1.handle.1" class="rounded-lg border-(--ui-bg-elevated)"/>
            <SplitterPanel id="slate.ui.group1.panel.contentSection" class="top-0 bottom-0 relative bg-(--ui-bg-muted) overflow-visible">
                <div class="h-full w-full p-2 overflow-visible">
                    <ScrollAreaRoot class="relative h-full w-full overflow-visible">
                        <ScrollAreaViewport class="w-full h-full rounded-lg border border-(--ui-border) bg-(--ui-bg) shadow-md">
                            <slot/>
                        </ScrollAreaViewport>
                        <ScrollAreaScrollbar>
                            <ScrollAreaThumb />
                        </ScrollAreaScrollbar>
                    </ScrollAreaRoot>
                </div>
            </SplitterPanel>
        </SplitterGroup>
    </div>
</template>

<style scoped>

</style>