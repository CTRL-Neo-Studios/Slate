<script>
// import { getCurrentWindow } from '@tauri-apps/api/window';
// import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'


// when using `"withGlobalTauri": true`, you may use
// const { getCurrentWindow } = window.__TAURI__.window;

// const appWindow = getCurrentWindow();

// document
//     .getElementById('titlebar-minimize')
//     ?.addEventListener('click', () => appWindow.minimize());
// document
//     .getElementById('titlebar-maximize')
//     ?.addEventListener('click', () => appWindow.toggleMaximize());
// document
//     .getElementById('titlebar-close')
//     ?.addEventListener('click', () => appWindow.close());
</script>

<template>
    <div data-tauri-drag-region class="bg-transparent h-7 z-40 select-none flex justify-end fixed top-0 left-0 right-0">
        <!--            <UButton size="sm" icon="lucide:minus" @click="getCurrentWebviewWindow().minimize()"/>-->
        <!--            <UButton size="sm" icon="lucide:app-window" @click="getCurrentWebviewWindow().toggleMaximize()"/>-->
        <!--            <UButton size="sm" icon="lucide:x" @click="getCurrentWebviewWindow().close()"/>-->
    </div>
    <UApp>
        <NuxtPage />
    </UApp>
</template>

<style scoped>
</style>