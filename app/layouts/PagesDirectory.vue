<script setup lang="ts">
// import {
//     ScrollAreaRoot, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport,
//     SplitterGroup,
//     SplitterPanel,
//     SplitterResizeHandle,
//     TreeItem,
//     TreeRoot,
//     TreeVirtualizer,
// } from 'reka-ui'
// import type { SlatePage } from '~/slate.types'
//
// const $route = useRoute()
// const $slate = useSlateFile()
// const $slateCommon = useSlateCommon()
//
// const currentPage = computed(() => $route.params.pageId as string)
// const pages = computed(() => $slate.getCurrentSlateDoc().value?.pages)
//
// // Track expanded state
// const expandedItems = ref<string[]>([])
// const $t = useToast()
//
// function remap() {
//     const path = $slate.getCurrentNestedPageDirs(currentPage)
//     expandedItems.value = path.map(node => node.uuid)
// }
// onMounted(() => {
//     remap()
//     $slate.subscribeOnPageReindex(remap)
// })
//
// const handleRename = (uuid: string, currentName: string) => {
//     $slateCommon.renamePage(uuid, currentName)
// }
//
// const handleDelete = (uuid: string, recursive: boolean) => {
//     $slateCommon.deletePage(uuid, recursive)
// }
//
// const handleCreatePage = async (mode: 'root' | 'current' | 'under', targetPageUUID: string) => {
//     await $slateCommon.createPage(mode, targetPageUUID)
// }
//
// const handleChangeIcon = (uuid: string) => {
//     $slateCommon.changeIcon(uuid)
// }

// console.log("wh")
</script>

<template>
<!--    <SplitterGroup id="directory-splitter" direction="horizontal" class="bg-neutral-200">-->
<!--        <SplitterPanel collapsible :collapsed-size="0" :min-size="10" :default-size="15" :max-size="20" class="p-2 pt-8">-->
<!--            <div class="flex items-center justify-start gap-1 mb-2 w-full">-->
<!--                <UDropdownMenu :items="[-->
<!--                    {-->
<!--                        label: 'In Document',-->
<!--                        onSelect() {-->
<!--                            handleCreatePage('root', currentPage)-->
<!--                        }-->
<!--                    },-->
<!--                    {-->
<!--                        label: 'At Same Level',-->
<!--                        disabled: $slate.getPageParent(currentPage)?.uuid == null,-->
<!--                        onSelect() {-->
<!--                            handleCreatePage('current', currentPage)-->
<!--                        }-->
<!--                    },-->
<!--                    {-->
<!--                        label: 'Under Current Page',-->
<!--                        onSelect() {-->
<!--                            handleCreatePage('under', currentPage)-->
<!--                        }-->
<!--                    },-->
<!--                ]">-->
<!--                    <UButton icon="lucide:file-plus" variant="soft" size="sm" label="New Page..."/>-->
<!--                </UDropdownMenu>-->
<!--            </div>-->
<!--            <USeparator class="mb-2"/>-->
<!--            <TreeRoot-->
<!--                :items="pages"-->
<!--                v-slot="{ flattenItems }"-->
<!--                class="list-none select-none w-full rounded-lg text-sm font-medium gap-1"-->
<!--                :get-key="(item) => item.uuid"-->
<!--                :expanded="$slate.getExpandedNodeCache().value"-->
<!--            >-->
<!--                <TreeItem-->
<!--                    v-for="item in flattenItems"-->
<!--                    v-slot="{ isExpanded, handleToggle }"-->
<!--                    :key="item._id"-->
<!--                    :style="{ 'padding-left': `${item.level - 1}rem` }"-->
<!--                    v-bind="item.bind"-->
<!--                    :class="['flex items-center rounded outline-none mb-1 gap-2']"-->
<!--                    @toggle="(event) => {event.preventDefault()}"-->
<!--                >-->
<!--                    <UContextMenu size="sm" :items="[-->
<!--                        [-->
<!--                          {-->
<!--                            label: 'Rename',-->
<!--                            icon: 'lucide:pen-line',-->
<!--                            onSelect: () => {-->
<!--                                handleRename(item.value.uuid, item.value.name)-->
<!--                            }-->
<!--                          },-->
<!--                          {-->
<!--                            label: 'Change Icon',-->
<!--                            icon: 'lucide:pen-line',-->
<!--                            onSelect: () => {-->
<!--                                handleChangeIcon(item.value.uuid)-->
<!--                            }-->
<!--                          },-->
<!--                          {-->
<!--                            label: 'Delete',-->
<!--                            icon: 'lucide:trash-2',-->
<!--                            color: 'error',-->
<!--                            onSelect: () => {-->
<!--                                handleDelete(item.value.uuid, true)-->
<!--                            }-->
<!--                          }-->
<!--                        ],-->
<!--                        [-->
<!--                          {-->
<!--                            label: 'New Child Page',-->
<!--                            icon: 'lucide:file-plus',-->
<!--                            onSelect: () => {-->
<!--                                handleCreatePage('under', item.value.uuid)-->
<!--                            }-->
<!--                          }-->
<!--                        ]-->
<!--                      ]">-->
<!--                        <UButton-->
<!--                            class="justify-start w-full z-10"-->
<!--                            :variant="currentPage == item.value.uuid ? 'solid' : 'ghost'"-->
<!--                            :icon="item.value.icon"-->
<!--                            :label="item.value.name"-->
<!--                            size="sm"-->
<!--                            @click="() => {-->
<!--                                navigateTo(`/document/${item.value.uuid}`)-->
<!--                            }"-->
<!--                        />-->
<!--                        <template v-if="(item.value.children?.length || 0) > 0">-->
<!--                            <UButton-->
<!--                                size="sm"-->
<!--                                variant="subtle"-->
<!--                                class="z-10" :icon="isExpanded ? 'lucide:folder-open': 'lucide:folder'"-->
<!--                                @click="() => {-->
<!--                                    if (isExpanded) {-->
<!--                                        $slate.uncacheExpandedNode(item.value.uuid)-->
<!--                                    } else {-->
<!--                                        $slate.cacheExpandedNode(item.value.uuid)-->
<!--                                    }-->
<!--                                    handleToggle()-->
<!--                                }"/>-->
<!--                        </template>-->
<!--                    </UContextMenu>-->
<!--                </TreeItem>-->
<!--            </TreeRoot>-->
<!--        </SplitterPanel>-->
<!--        <SplitterResizeHandle class="w-2"/>-->
<!--        <SplitterPanel :min-size="20" class="rounded-l-2xl bg-neutral-50 m-2">-->
<!--            <ScrollAreaRoot class="h-96">-->
<!--                <ScrollAreaViewport>-->
<!--                    <slot/>-->
<!--                </ScrollAreaViewport>-->
<!--                <ScrollAreaScrollbar-->
<!--                    class="flex select-none touch-none p-0.5 z-20 bg-blackA1 transition-colors duration-[160ms] ease-out hover:bg-blackA2 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"-->
<!--                    orientation="vertical"-->
<!--                >-->
<!--                    <ScrollAreaThumb-->
<!--                        class="flex-1 bg-mauve10 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]"-->
<!--                    />-->
<!--                </ScrollAreaScrollbar>-->
<!--                <ScrollAreaScrollbar-->
<!--                    class="flex select-none touch-none p-0.5 bg-blackA6 transition-colors duration-[160ms] ease-out hover:bg-blackA8 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"-->
<!--                    orientation="horizontal"-->
<!--                >-->
<!--                    <ScrollAreaThumb-->
<!--                        class="flex-1 bg-mauve10 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]"-->
<!--                    />-->
<!--                </ScrollAreaScrollbar>-->
<!--            </ScrollAreaRoot>-->
<!--        </SplitterPanel>-->
<!--    </SplitterGroup>-->
    <slot/>
</template>

<style scoped>

</style>