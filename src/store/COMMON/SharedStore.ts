/* eslint-disable @typescript-eslint/naming-convention */
import { acceptHMRUpdate, defineStore } from "pinia";

export const SharedStore = defineStore("shared", {
    state: () => ({
        storeData: new Map<string, any>(),
    }),
    actions: {
        setItem(key: string, value: any) {
            this.storeData.set(key, value);
        },
        getItem(key: string) {
            return this.storeData.get(key);
        },
        removeItem(key: string) {
            this.storeData.delete(key);
        },
        clearItems() {
            this.storeData.clear();
        },
    }
});

// HMR support for the store
if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(SharedStore, import.meta.hot));
}
