// composables/useSlateSheet.ts
import type { PossiblyRef } from '~/types/utility.types'
import type { ComponentInstance } from '~/types/slate_sheet.types'

export const useSlateSheet = () => {
    const $slate = useSlateFile()

    const addComponent = (pageUUID: PossiblyRef<string>, instance: string) => {
        const current = $slate.getPageSheet(pageUUID)
        current?.instances.push()
    }

    const removeComponent = (pageUUID: PossiblyRef<string>, instanceId: string) => {

    }

    const initSheet = (pageUUID: PossiblyRef<string>) => {
        $slate.setPageSheet(pageUUID, defaultSlateSheet())
    }
}
