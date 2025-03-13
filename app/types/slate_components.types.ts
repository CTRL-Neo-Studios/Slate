// Update existing component types to use schemas
import type { ComponentConfig, ComponentInstance } from '~/types/slate_sheet.types'

export type SlateButtonComponent = ComponentInstance & {
    config: ComponentConfig & {
        label: string,
        icon: string,
        variant: 'primary' | 'secondary',
    }
}

export type SlateInputComponent = ComponentInstance & {
    config: ComponentConfig & {
        placeholder: string,
        value: string,
    }
}

export type SlateLabelComponent = ComponentInstance & {
    config: ComponentConfig & {
        text: string,
        textStyle: string,
        alignment: 'left' | 'center' | 'right'
    }
};

export type SlateCheckboxComponent = ComponentInstance & {
    config: ComponentConfig & {
        label: string,
        checked: boolean,
        indeterminate: boolean
    }
};

export type SlateInputNumberComponent = ComponentInstance & {
    config: ComponentConfig & {
        value: number,
        min?: number,
        max?: number,
        step: number
    }
};

export type SlateDropdownComponent = ComponentInstance & {
    config: ComponentConfig & {
        options: string[],
        selected: string | string[],
        multiple: boolean
    }
};