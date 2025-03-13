<script setup lang="ts">
const $route = useRoute()
const $slate = useSlateFile()
const $slateCommon = useSlateCommon()

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

</script>

<template>
    <div>
        <div class="w-full fixed top-0 left-0 right-0 h-fit z-10">
            <div class="flex items-center justify-center p-2 gap-2 select-none cursor-default" data-tauri-drag-region>
                <div class="flex items-center justify-center p-1 px-2 gap-2 rounded-lg backdrop-blur-md z-20 w-fit" data-tauri-drag-region>
                    <!--Ignore The Error Here... fucking typescript-->
                    <UBreadcrumb :items="breadcrumbs" class="text-sm select-none gap-1" data-tauri-drag-region>
                        <template #document="{item}" data-tauri-drag-region>
                            <div data-tauri-drag-region class="px-1">{{item.label}}</div>
                        </template>
                        <template #page="{item}" data-tauri-drag-region>
                            <UDropdownMenu :items="[
                                        {
                                            label: 'Rename Page',
                                            onSelect () {
                                                $slateCommon.renamePage($pageId, 'Page')
                                            }
                                        },
                                        {
                                            label: 'Change Icon',
                                            onSelect () {
                                                $slateCommon.changeIcon($pageId)
                                            }
                                        }
                                    ]">
                                <UButton data-tauri-drag-region class="px-1" :icon="item?.icon || 'lucide:file'" size="sm" :label="item?.label || 'Untitled Page'" variant="link" />
                            </UDropdownMenu>
                        </template>
                        <template #dropdown="{item}" data-tauri-drag-region>
                            <UDropdownMenu :items="(item as any).children || []">
                                <UButton data-tauri-drag-region class="px-1" :icon="item.icon" size="sm" variant="link" />
                            </UDropdownMenu>
                        </template>
                        <template #separator data-tauri-drag-region>
                            <div class="text-(--ui-text-muted)" data-tauri-drag-region>/</div>
                        </template>
                    </UBreadcrumb>
                    <Icon data-tauri-drag-region name="lucide:file-warning" class="size-3" v-if="$slate.getFilePath().value == null || ''"/>
                    <template v-else>
                        <Icon data-tauri-drag-region name="lucide:file-clock" class="size-3 animate-pulse animate" v-if="$slate.isSavingFile().value"/>
                        <Icon data-tauri-drag-region name="lucide:file-check" class="size-3" v-else-if="$slate.isFileSaved().value"/>
                        <Icon data-tauri-drag-region name="lucide:file-x" class="size-3 bg-error-500" v-else/>
                    </template>
                </div>
            </div>
        </div>
        <slot/>
    </div>
</template>

<style scoped>

</style>