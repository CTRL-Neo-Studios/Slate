import type { ComponentSchema } from '~/types/slate_sheet.types'

export function getSlateSheetSchema() {
    return {
        LABEL: {
            id: 'schema-label',
            name: 'Text Label',
            slug: 'label',
            properties: [
                {
                    id: 'text',
                    name: 'Text Content',
                    type: 'string',
                    defaultValue: 'New Label',
                    required: true
                },
                {
                    id: 'textStyle',
                    name: 'Text Style',
                    type: 'options',
                    defaultValue: 'body',
                    options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body', 'caption'],
                    required: false
                }
            ],
            connectionPoints: [
                {
                    id: 'text-updated',
                    name: 'Text Updated',
                    direction: 'output',
                    dataType: 'data'
                }
            ]
        } as ComponentSchema,

        CHECKBOX: {
            id: 'schema-checkbox',
            name: 'Checkbox',
            slug: 'checkbox',
            properties: [
                {
                    id: 'label',
                    name: 'Label',
                    type: 'string',
                    defaultValue: 'Checkbox',
                    required: false
                },
                {
                    id: 'checked',
                    name: 'Checked State',
                    type: 'boolean',
                    defaultValue: false,
                    required: true
                }
            ],
            connectionPoints: [
                {
                    id: 'onChange',
                    name: 'On Change',
                    direction: 'output',
                    dataType: 'event'
                },
                {
                    id: 'checked-state',
                    name: 'Checked State',
                    direction: 'output',
                    dataType: 'data'
                }
            ]
        } as ComponentSchema,

        NUMBER_INPUT: {
            id: 'schema-number-input',
            name: 'Number Input',
            slug: 'number-input',
            properties: [
                {
                    id: 'value',
                    name: 'Value',
                    type: 'number',
                    defaultValue: 0,
                    required: true
                },
                {
                    id: 'min',
                    name: 'Minimum Value',
                    type: 'number',
                    required: false
                },
                {
                    id: 'max',
                    name: 'Maximum Value',
                    type: 'number',
                    required: false
                },
                {
                    id: 'step',
                    name: 'Step Size',
                    type: 'number',
                    defaultValue: 1,
                    required: false
                }
            ],
            connectionPoints: [
                {
                    id: 'onChange',
                    name: 'On Change',
                    direction: 'output',
                    dataType: 'event'
                },
                {
                    id: 'value-output',
                    name: 'Current Value',
                    direction: 'output',
                    dataType: 'data'
                }
            ]
        } as ComponentSchema,

        DROPDOWN: {
            id: 'schema-dropdown',
            name: 'Dropdown Menu',
            slug: 'dropdown',
            properties: [
                {
                    id: 'options',
                    name: 'Options',
                    type: 'string',
                    defaultValue: 'Option 1,Option 2,Option 3',
                    required: true
                },
                {
                    id: 'selected',
                    name: 'Selected Value',
                    type: 'string',
                    required: false
                },
                {
                    id: 'multiple',
                    name: 'Multiple Selection',
                    type: 'boolean',
                    defaultValue: false,
                    required: false
                }
            ],
            connectionPoints: [
                {
                    id: 'onChange',
                    name: 'On Change',
                    direction: 'output',
                    dataType: 'event'
                },
                {
                    id: 'selection-output',
                    name: 'Selected Values',
                    direction: 'output',
                    dataType: 'data'
                }
            ]
        } as ComponentSchema
    } as const;
}