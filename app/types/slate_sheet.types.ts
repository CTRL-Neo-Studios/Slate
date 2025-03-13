export type SlateSheet = {
    data: SlateSheetData,
    behavior: SlateSheetBehavior,
    schemas: ComponentSchema[], // Component type definitions
    instances: ComponentInstance[], // Actual component instances
    connections: ComponentConnection[] // Wiring between components/nodes
}

export type SlateSheetData = {

}

export type SlateSheetBehavior = {

}

// Component Type Schema
export type ComponentSchema = {
    id: string,
    name: string,
    slug: string, // e.g., 'button', 'input'
    properties: ComponentProperty[],
    connectionPoints: ComponentConnectionPoint[],
    styleOptions?: string[] // Optional style variants
}

export type ComponentProperty = {
    id: string,
    name: string,
    type: 'string' | 'number' | 'boolean' | 'color' | 'options',
    defaultValue: unknown,
    required: boolean
}

export type ComponentConnectionPoint = {
    id: string,
    name: string,
    direction: 'input' | 'output',
    dataType: 'event' | 'data' | 'both'
}

// Component Instance
export type ComponentInstance = {
    id: string,
    schemaId: string, // References ComponentSchema
    config: ComponentConfig,
    position: { x: number, y: number, w: number, h: number },
    connections: ComponentConnection[],
    styleOverrides?: Record<string, unknown>
}

export type ComponentConfig = Record<string, unknown> & {
    // Common base config for all components
    visible: boolean,
    disabled: boolean,
    // Component-specific props will be merged via schema
}

// Connection System
export type ComponentConnection = {
    id: string,
    source: ConnectionEndpoint,
    target: ConnectionEndpoint,
    dataType?: 'event' | 'data'
}

export type ConnectionEndpoint = {
    type: 'component' | 'node' | 'database',
    id: string,
    pointId?: string // Connection point ID from schema
}