import { createPinia, setActivePinia } from "pinia";

// Single shared Pinia, active from the moment this module loads so store
// calls outside the main app (popups, promise callbacks) always resolve.
export const pinia = createPinia();
setActivePinia(pinia);
