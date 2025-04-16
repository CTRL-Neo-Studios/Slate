// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    app: {
        pageTransition: { name: 'page', mode: 'out-in' },
        layoutTransition: { name: 'layout', mode: 'out-in' }
    },
    devtools: { enabled: false },
    // Enable SSG
    ssr: false,
    // Enables the development server to be discoverable by other devices when running on iOS physical devices
    devServer: { host: process.env.TAURI_DEV_HOST || 'localhost' },
    vite: {
        // Better support for Tauri CLI output
        clearScreen: false,
        // Enable environment variables
        // Additional environment variables can be found at
        // https://v2.tauri.app/reference/environment-variables/
        envPrefix: ['VITE_', 'TAURI_'],
        server: {
            // Tauri requires a consistent port
            strictPort: true,
        },
        resolve: {
            alias: {
                'html2canvas': 'html2canvas-pro'
            }
        }
    },

    modules: ['@nuxt/ui', // '@nuxt/eslint',
    'nuxt-tiptap-editor', '@nuxtjs/mdc'],
    tiptap: {
        prefix: 'Tiptap', //prefix for Tiptap imports, composables not included
    },

    css: ['~/assets/css/main.css', 'katex/dist/katex.min.css'],

    future: {
        compatibilityVersion: 4,
    },

    compatibilityDate: '2024-11-27',
    fonts: {
        families: [
            { name: 'Inter' },
            { name: 'Noto Sans Simplified Chinese' }
        ]
    }
})