import type { SlateThemePreset } from '~/types/slate.types'

export function slateDefaultThemes() {

    function slate(): SlateThemePreset {
        return {
            id: '0',
            customCss: '',
            documentCss: '',
            documentFont: 'Inter',
            interfaceFont: 'Inter',
            roundedCornerRadius: 0.25, // 0.25rem
            lightThemeColors: {
                uiTextDimmed: 'oklch(70.5% 0.015 286.067)', // zinc-400
                uiTextMuted: 'oklch(55.2% 0.016 285.938)', // zinc-500
                uiTextToned: 'oklch(44.2% 0.017 285.786)', // zinc-600
                uiText: 'oklch(37% 0.013 285.805)', // zinc-700
                uiTextHighlighted: 'oklch(21% 0.006 285.885)', // zinc-900

                uiBg: 'oklch(100% 0 0)', // white
                uiBgMuted: 'oklch(98.5% 0 0)', // zinc-50
                uiBgElevated: 'oklch(96.7% 0.001 286.375)', // zinc-100
                uiBgAccented: 'oklch(92% 0.004 286.32)', // zinc-200
                uiBgInverted: 'oklch(21% 0.006 285.885)', // zinc-900

                uiBorder: 'oklch(92% 0.004 286.32)', // zinc-200
                uiBorderMuted: 'oklch(92% 0.004 286.32)', // zinc-200
                uiBorderAccented: 'oklch(87.1% 0.006 286.286)', // zinc-300
                uiBorderInverted: 'oklch(21% 0.006 285.885)', // zinc-900

                uiError: 'oklch(63.7% 0.237 25.331)', // red-500
                uiInfo: 'oklch(62.3% 0.214 259.815)', // blue-500
                uiPrimary: 'oklch(27.4% 0.006 286.033)', // zinc-800
                uiSecondary: 'oklch(14.1% 0.005 285.823)', // zinc-950
                uiSuccess: 'oklch(72.3% 0.219 149.579)', // green-500
                uiWarning: 'oklch(76.9% 0.188 70.08)', // amber-500
            },
            darkThemeColors: {
                uiTextDimmed: 'oklch(55.2% 0.016 285.938)', // zinc-500
                uiTextMuted: 'oklch(70.5% 0.015 286.067)', // zinc-400
                uiTextToned: 'oklch(87.1% 0.006 286.286)', // zinc-300
                uiText: 'oklch(92% 0.004 286.32)', // zinc-200
                uiTextHighlighted: 'oklch(100% 0 0)', // white

                uiBg: 'oklch(21% 0.006 285.885)', // zinc-900
                uiBgMuted: 'oklch(27.4% 0.006 286.033)', // zinc-800
                uiBgElevated: 'oklch(27.4% 0.006 286.033)', // zinc-800
                uiBgAccented: 'oklch(27.4% 0.006 286.033)', // zinc-700
                uiBgInverted: 'oklch(100% 0 0)', // white

                uiBorder: 'oklch(27.4% 0.006 286.033)', // zinc-800
                uiBorderMuted: 'oklch(37% 0.013 285.805)', // zinc-700
                uiBorderAccented: 'oklch(37% 0.013 285.805)', // zinc-700
                uiBorderInverted: 'oklch(100% 0 0)', // white

                uiError: 'oklch(63.7% 0.237 25.331)', // red-500
                uiInfo: 'oklch(62.3% 0.214 259.815)', // blue-500
                uiPrimary: 'oklch(96.7% 0.001 286.375)', // zinc-50
                uiSecondary: 'oklch(87.1% 0.006 286.286)', // zinc-200
                uiSuccess: 'oklch(72.3% 0.219 149.579)', // green-500
                uiWarning: 'oklch(76.9% 0.188 70.08)', // amber-500
            },
            lightProseColors: {
                body: 'oklch(27.4% 0.006 286.033)', // zinc-800, body text
                bold: 'oklch(21% 0.006 285.885)', // zinc-900, bold text, strong, em
                bullets: 'oklch(21% 0.006 285.885)', // zinc-900, bullet points
                captions: 'oklch(37% 0.013 285.805)', // zinc-700, italics
                code: 'oklch(44.2% 0.017 285.786)', // zinc-600, inline code
                links: 'oklch(37% 0.013 285.805)', // zinc-700, inline links and wikilinks
                headings: 'oklch(14.1% 0.005 285.823)', // zinc-950, Headers
                quotes: 'oklch(44.2% 0.017 285.786)', // zinc-600, the quote text in quoteblocks
                quoteBorders: 'oklch(44.2% 0.017 285.786)', // zinc-600, the quote side stripe in quoteblocks
            },
            darkProseColors: {
                body: 'oklch(92% 0.004 286.32)', // zinc-200, body text
                bold: 'oklch(96.7% 0.001 286.375)', // zinc-100, bold text, strong, em
                bullets: 'oklch(92.8% 0.006 264.531)', // zinc-200, bullet points
                captions: 'oklch(87.1% 0.006 286.286)', // zinc-300, italics
                code: 'oklch(70.5% 0.015 286.067)', // zinc-400, inline code
                links: 'oklch(87.1% 0.006 286.286)', // zinc-300, inline links and wikilinks
                headings: 'oklch(98.5% 0 0)', // zinc-50, Headers
                quotes: 'oklch(70.5% 0.015 286.067)', // zinc-400, the quote text in quoteblocks
                quoteBorders: 'oklch(70.5% 0.015 286.067)', // zinc-400, the quote side stripe in quoteblocks
            },
        } satisfies SlateThemePreset
    }

    function flexoki(): SlateThemePreset {
        return {
            id: '1',
            customCss: '',
            documentCss: '',
            documentFont: 'Inter',
            interfaceFont: 'Inter',
            roundedCornerRadius: 0.25, // 0.25rem
            lightThemeColors: {
                uiTextDimmed: 'oklch(0.77 0.0128 96.47)',
                uiTextMuted: 'oklch(0.62 0.0078 88.67)',
                uiTextToned: 'oklch(0.54 0.0078 97.45)',
                uiText: 'oklch(0.37 0.0044 67.69)',
                uiTextHighlighted: 'oklch(0.17 0.0017 17.32)',

                uiBg: 'oklch(0.99 0.0161 95.22)',
                uiBgMuted: 'oklch(0.95 0.0147 98.29)',
                uiBgElevated: 'oklch(0.92 0.0149 98.3)',
                uiBgAccented: 'oklch(0.85 0.0137 102.05)',
                uiBgInverted: 'oklch(0.17 0.0017 17.32)',

                uiBorder: 'oklch(0.85 0.0137 102.05)',
                uiBorderMuted: 'oklch(0.88 0.0137 97.46)',
                uiBorderAccented: 'oklch(0.77 0.0128 96.47)',
                uiBorderInverted: 'oklch(0.17 0.0017 17.32)',

                uiError: 'oklch(0.6 0.1692 28.38)',
                uiInfo: 'oklch(0.67 0.0999 186.58)',
                uiPrimary: 'oklch(0.17 0.0017 17.32)',
                uiSecondary: 'oklch(0.63 0.1098 291)',
                uiSuccess: 'oklch(0.65 0.1242 119.38)',
                uiWarning: 'oklch(0.73 0.1462 87.46)',
            },
            darkThemeColors: {
                uiTextDimmed: 'oklch(0.45 0.005 91.5)',
                uiTextMuted: 'oklch(0.62 0.0078 88.67)',
                uiTextToned: 'oklch(0.77 0.0128 96.47)',
                uiText: 'oklch(0.85 0.0137 102.05)',
                uiTextHighlighted: 'oklch(0.99 0.0161 95.22)',

                uiBg: 'oklch(0.17 0.0017 17.32)',
                uiBgMuted: 'oklch(0.22 0.0025 67.7)',
                uiBgElevated: 'oklch(0.27 0.0023 67.73)',
                uiBgAccented: 'oklch(0.37 0.0044 67.69)',
                uiBgInverted: 'oklch(0.99 0.0161 95.22)',

                uiBorder: 'oklch(0.27 0.0023 67.73)',
                uiBorderMuted: 'oklch(0.32 0.0038 84.58)',
                uiBorderAccented: 'oklch(0.37 0.0044 67.69)',
                uiBorderInverted: 'oklch(0.85 0.0137 102.05)',

                uiError: 'oklch(0.68 0.1523 29.79)',
                uiInfo: 'oklch(0.73 0.0968 180.73)',
                uiPrimary: 'oklch(0.99 0.0161 95.22)',
                uiSecondary: 'oklch(0.71 0.0802 295.14)',
                uiSuccess: 'oklch(0.72 0.1178 117.2)',
                uiWarning: 'oklch(0.79 0.147 89.37)',
            },
            lightProseColors: {
                body: 'oklch(0.37 0.0044 67.69)', // zinc-800, body text
                bold: 'oklch(0.27 0.0023 67.73)', // zinc-900, bold text, strong, em
                bullets: 'oklch(0.27 0.0023 67.73)', // zinc-900, bullet points
                captions: 'oklch(0.45 0.005 91.5)', // zinc-700, italics
                code: 'oklch(0.54 0.0078 97.45)', // zinc-600, inline code
                links: 'oklch(0.45 0.005 91.5)', // zinc-700, inline links and wikilinks
                headings: 'oklch(0.22 0.0025 67.7)', // zinc-950, Headers
                quotes: 'oklch(0.45 0.005 91.5)', // zinc-700, the quote text in quoteblocks
                quoteBorders: 'oklch(0.45 0.005 91.5)', // zinc-700, the quote side stripe in quoteblocks
            },
            darkProseColors: {
                body: 'oklch(0.85 0.0137 102.05)', // zinc-200, body text
                bold: 'oklch(0.92 0.0149 98.3)', // zinc-100, bold text, strong, em
                bullets: 'oklch(0.85 0.0137 102.05)', // zinc-200, bullet points
                captions: 'oklch(0.77 0.0128 96.47)', // zinc-300, italics
                code: 'oklch(0.7 0.0103 93.62)', // zinc-400, inline code
                links: 'oklch(0.77 0.0128 96.47)', // zinc-300, inline links and wikilinks
                headings: 'oklch(0.95 0.0147 98.29)', // zinc-50, Headers
                quotes: 'oklch(0.77 0.0128 96.47)', // zinc-300, the quote text in quoteblocks
                quoteBorders: 'oklch(0.77 0.0128 96.47)', // zinc-300, the quote side stripe in quoteblocks
            },
        } satisfies SlateThemePreset
    }

    function defaults(): SlateThemePreset[] {
        return [
            slate(),
            flexoki()
        ]
    }

    return {
        slate,
        flexoki,
        defaults
    }
}