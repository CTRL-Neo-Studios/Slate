import type {
    SlateSheet,
    ComponentInstance,
    ComponentConnection,
    ComponentConfig,
    ConnectionEndpoint
} from '~/types/slate_sheet.types'
import { defaultSlateSheet } from '~/utils/slateutils'
import { getSlateSheetSchema } from '~/utils/slateSheetSchema'

export function useSlateSheet() {
    const sheet = ref<SlateSheet>(defaultSlateSheet())
    const selectedComponentId = ref<string | null>(null)
    const lastError = ref<Error | null>(null)

    // Get the schema definitions
    const schema = getSlateSheetSchema()

    // Create a new empty sheet
    function createSheet(): SlateSheet {
        sheet.value = defaultSlateSheet()
        selectedComponentId.value = null
        return sheet.value
    }

    // Add a component to the sheet
    function addComponent(
        schemaId: string,
        position = { x: 0, y: 0, w: 200, h: 100 },
        config: Partial<ComponentConfig> = {}
    ): ComponentInstance | null {
        try {
            lastError.value = null

            // Find the schema for this component type
            const schemaEntry = Object.values(schema).find(s => s.id === schemaId)
            if (!schemaEntry) {
                throw new Error(`Schema not found for ID: ${schemaId}`)
            }

            // Create default configuration from schema
            const defaultConfig: ComponentConfig = {
                visible: true,
                disabled: false
            }

            // Add default values from schema properties
            for (const prop of schemaEntry.properties) {
                defaultConfig[prop.id] = prop.defaultValue
            }

            // Create the component instance
            const component: ComponentInstance = {
                id: useUUID(),
                schemaId,
                config: { ...defaultConfig, ...config },
                position,
                connections: []
            }

            // Add to sheet
            sheet.value.instances.push(component)
            return component
        } catch (err) {
            lastError.value = err instanceof Error ? err : new Error(String(err))
            return null
        }
    }

    // Remove a component from the sheet
    function removeComponent(componentId: string): boolean {
        try {
            lastError.value = null

            const index = sheet.value.instances.findIndex(c => c.id === componentId)
            if (index === -1) return false

            // Remove any connections involving this component
            sheet.value.connections = sheet.value.connections.filter(
                c => c.source.id !== componentId && c.target.id !== componentId
            )

            // Remove the component
            sheet.value.instances.splice(index, 1)

            // If this was the selected component, deselect it
            if (selectedComponentId.value === componentId) {
                selectedComponentId.value = null
            }

            return true
        } catch (err) {
            lastError.value = err instanceof Error ? err : new Error(String(err))
            return false
        }
    }

    // Update a component's configuration
    function updateComponentConfig(componentId: string, config: Partial<ComponentConfig>): boolean {
        try {
            lastError.value = null

            const component = sheet.value.instances.find(c => c.id === componentId)
            if (!component) return false

            component.config = { ...component.config, ...config }
            return true
        } catch (err) {
            lastError.value = err instanceof Error ? err : new Error(String(err))
            return false
        }
    }

    // Create a connection between components
    function connectComponents(
        sourceId: string,
        sourcePointId: string,
        targetId: string,
        targetPointId: string,
        dataType: 'event' | 'data' = 'data'
    ): ComponentConnection | null {
        try {
            lastError.value = null

            // Validate source and target exist
            const source = sheet.value.instances.find(c => c.id === sourceId)
            const target = sheet.value.instances.find(c => c.id === targetId)

            if (!source || !target) {
                throw new Error('Source or target component not found')
            }

            // Create connection
            const connection: ComponentConnection = {
                id: useUUID(),
                source: {
                    type: 'component',
                    id: sourceId,
                    pointId: sourcePointId
                },
                target: {
                    type: 'component',
                    id: targetId,
                    pointId: targetPointId
                },
                dataType
            }

            // Add to connections array
            sheet.value.connections.push(connection)

            return connection
        } catch (err) {
            lastError.value = err instanceof Error ? err : new Error(String(err))
            return null
        }
    }

    // Remove a connection
    function removeConnection(connectionId: string): boolean {
        try {
            lastError.value = null

            const index = sheet.value.connections.findIndex(c => c.id === connectionId)
            if (index === -1) return false

            sheet.value.connections.splice(index, 1)
            return true
        } catch (err) {
            lastError.value = err instanceof Error ? err : new Error(String(err))
            return false
        }
    }

    // Move a component
    function moveComponent(componentId: string, newPosition: Partial<{ x: number, y: number, w: number, h: number }>): boolean {
        try {
            lastError.value = null

            const component = sheet.value.instances.find(c => c.id === componentId)
            if (!component) return false

            component.position = { ...component.position, ...newPosition }
            return true
        } catch (err) {
            lastError.value = err instanceof Error ? err : new Error(String(err))
            return false
        }
    }

    return {
        sheet,
        selectedComponentId,
        lastError,
        createSheet,
        addComponent,
        removeComponent,
        updateComponentConfig,
        connectComponents,
        removeConnection,
        moveComponent
    }
}
