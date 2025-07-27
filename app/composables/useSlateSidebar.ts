export function useSlateSidebar() {
    const collapsed = useState<boolean>('slate.ui.sidebar.collapsed', () => false)
    let callbacks: {id: string, callback: any}[] = []

    function toggleSidebar() {
        setSidebar(!unref(collapsed))
        invokeCallbacks()
    }

    function setSidebar(value: boolean) {
        collapsed.value = value
    }

    function onCallback(newValue: boolean) {
        if (unref(newValue) != unref(collapsed)) {
            toggleSidebar()
        }
    }

    function subscribe(callback: any) {
        const id = useUUID()
        callbacks.push({id: id, callback: callback })
        return id
    }

    function invokeCallbacks() {
        callbacks.forEach((i) => {
            i.callback(unref(collapsed))
        })
    }

    function unsubscribe(id: string) {
        callbacks = callbacks.filter(i => i.id !== id)
    }

    return {
        collapsed,
        toggleSidebar,
        setSidebar,
        onCallback,
        subscribe,
        invokeCallbacks,
        unsubscribe
    }
}