import Color from 'colorjs.io'

export function colorUtils() {

}

export function hexToOklch(hex: string) {
    return (new Color(hex)).to('oklch')
}