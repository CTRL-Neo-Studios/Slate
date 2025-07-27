<!-- components/ThemeManager.vue -->
<script setup lang="ts">
import { hexToOklch } from '~/utils/color'
import { kebabCase } from '~/utils/string'
import type { SlateProseColors, SlateThemeColors, SlateThemePreset } from '~/types/slate.types'

const props = defineProps<{
    theme: SlateThemePreset
}>()

const applyColorsToRoot = (colors: Record<string, string>, prefix: string) => {
    const root = document.documentElement
    for (const [key, value] of Object.entries(colors)) {
        root.style.setProperty(`--${prefix}-${kebabCase(key)}`, hexToOklch(value).toString())
    }
}

const applyThemeColors = (theme: SlateThemePreset) => {
    // Apply colors to root element
    applyColorsToRoot(theme.lightThemeColors, 'ui')
    applyColorsToRoot(theme.lightProseColors, 'prose')

    // Apply other theme properties
    document.documentElement.style.setProperty('--rounded', `${theme.roundedCornerRadius}px`)
    document.documentElement.style.setProperty('--font-sans', theme.interfaceFont)
    document.documentElement.style.setProperty('--font-prose', theme.documentFont)

    // Handle dark mode colors via media query
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleColorSchemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
        const colors = e.matches ? theme.darkThemeColors : theme.lightThemeColors
        const proseColors = e.matches ? theme.darkProseColors : theme.lightProseColors

        applyColorsToRoot(colors, 'ui')
        applyColorsToRoot(proseColors, 'prose')
    }

    // Set initial colors and listen for changes
    handleColorSchemeChange(mediaQuery)
    mediaQuery.addEventListener('change', handleColorSchemeChange)

    // Cleanup listener when component unmounts
    onUnmounted(() => {
        mediaQuery.removeEventListener('change', handleColorSchemeChange)
    })
}

const applyCustomCss = (css: string) => {
    let style = document.getElementById('custom-theme-css')
    if (!style) {
        style = document.createElement('style')
        style.id = 'custom-theme-css'
        document.head.appendChild(style)
    }
    style.textContent = css
}

watch(() => props.theme, (newTheme) => {
    applyThemeColors(newTheme)
    applyCustomCss(newTheme.customCss)
}, { immediate: true, deep: true })
</script>

<template>
    <div
        :style="{
      '--rounded': `${theme.roundedCornerRadius}px`,
      '--font-sans': theme.interfaceFont,
      '--font-prose': theme.documentFont
    }"
    >
        <slot />
    </div>
</template>