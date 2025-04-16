import type { SlateThemePreset } from '~/types/slate.types'
import { slateDefaultThemes } from '~/utils/slate_themes'

export function useSlateTheme() {
    const colorMode = useColorMode()

    function setTheme(preset: SlateThemePreset) {
        const root = document.documentElement
        const isDark = colorMode.value === 'dark'

        // Apply UI theme colors
        const themeColors = isDark ? preset.darkThemeColors : preset.lightThemeColors
        Object.entries(themeColors).forEach(([key, value]) => {
            const cssVarName = `--ui-${key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`
            console.log(`replacing ${cssVarName} value`)
            root.style.setProperty(cssVarName, value)
        })

        // Apply prose colors
        const proseColors = isDark ? preset.darkProseColors : preset.lightProseColors
        Object.entries(proseColors).forEach(([key, value]) => {
            const cssVarName = `--prose-${key.toLowerCase()}`
            root.style.setProperty(cssVarName, value)
        })

        // Apply special colors (white)
        root.style.setProperty('--color-white', isDark ? preset.darkThemeColors.uiTextHighlighted : preset.lightThemeColors.uiTextHighlighted)

        // Apply theme settings
        root.style.setProperty('--rounded-corner-radius', `${preset.roundedCornerRadius}rem`)
        root.style.setProperty('--font-editor', preset.documentFont)
        root.style.setProperty('--font-sans', `${preset.documentFont}, sans-serif`)
        root.style.setProperty('--font-code', preset.interfaceFont)
        root.style.setProperty('--font-mono', preset.interfaceFont)

        // Apply custom CSS (append mode)
        if (preset.customCss) {
            injectCustomCss(preset.customCss, 'slate-ui-custom-css', false)
        }
        if (preset.documentCss) {
            injectCustomCss(preset.documentCss, 'slate-document-custom-css', false)
        }
    }

    function setToDefault() {
        setTheme(slateDefaultThemes().slate())
    }

    /**
     * Injects custom CSS into the document
     * @param css - The CSS to inject
     * @param id - Unique identifier for the style element
     * @param replace - Whether to replace existing styles (default: false)
     */
    function injectCustomCss(css: string, id: string, replace: boolean = false) {
        if (replace) {
            // Replace mode - remove existing style if it exists
            const existingStyle = document.getElementById(id)
            if (existingStyle) {
                existingStyle.remove()
            }
        } else {
            // Append mode - only add if it doesn't exist
            if (document.getElementById(id)) {
                return
            }
        }

        const style = document.createElement('style')
        style.id = id
        style.textContent = css
        document.head.appendChild(style)
    }

    return {
        colorMode,
        setToDefault,
        setTheme,
        injectCustomCss
    }
}