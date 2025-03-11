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
<!--    <Head>-->
<!--        <div data-tauri-drag-region class="bg-transparent h-7 z-40 select-none flex justify-end fixed top-0 left-0 right-0">-->
<!--            &lt;!&ndash;            <UButton size="sm" icon="lucide:minus" @click="getCurrentWebviewWindow().minimize()"/>&ndash;&gt;-->
<!--            &lt;!&ndash;            <UButton size="sm" icon="lucide:app-window" @click="getCurrentWebviewWindow().toggleMaximize()"/>&ndash;&gt;-->
<!--            &lt;!&ndash;            <UButton size="sm" icon="lucide:x" @click="getCurrentWebviewWindow().close()"/>&ndash;&gt;-->
<!--        </div>-->
<!--    </Head>-->
    <NuxtLoadingIndicator color="gray"/>
    <UApp>
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </UApp>
</template>

<style>
.page-enter-active,
.page-leave-active {
    transition: all 0.25s;
}
.page-enter-from,
.page-leave-to {
    opacity: 0;
    filter: blur(1rem);
}

.layout-enter-active,
.layout-leave-active {
    transition: all 0.25s;
}
.layout-enter-from,
.layout-leave-to {
    opacity: 0;
    filter: blur(1rem);
}

</style>