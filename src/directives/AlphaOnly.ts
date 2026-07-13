import { type Directive } from "vue";

export const alphaOnly: Directive = {
    created(el, binding) {
        el._alphaOnlyEnabled = false;
        el._alphaOnlyCleanup = null;
        
        const setupDirective = (enabled: boolean) => {
            // Clean up existing listener if any
            if (el._alphaOnlyCleanup) {
                el._alphaOnlyCleanup();
                el._alphaOnlyCleanup = null;
            }
            
            if (!enabled) {
                el._alphaOnlyEnabled = false;
                return;
            }
            
            setTimeout(() => {
                // Get native <input> from ion-input, ion-textarea, or regular input
                const inputEl = el.tagName === "ION-INPUT" || el.tagName === "ION-TEXTAREA"
                    ? el.el?.querySelector("input, textarea")
                    : el;

                if (!inputEl) return;
                
                const handleInput = (e: Event) => {
                    const target = e.target as HTMLInputElement;
                    // Allow only alphabetic characters (A-Z, a-z) and spaces
                    const cleaned = target.value.replaceAll(/[^a-zA-Z ]/g, "");
                    if (target.value !== cleaned) {
                        target.value = cleaned;
                        target.dispatchEvent(new Event("input")); // Ensure v-model updates
                    }
                };
                
                inputEl.addEventListener("input", handleInput);
                el._alphaOnlyCleanup = () => inputEl.removeEventListener("input", handleInput);
                el._alphaOnlyEnabled = true;
            }, 100);
        };
        
        setupDirective(binding.value);
    },

    updated(el, binding) {
        if (binding.value !== binding.oldValue) {
            const setupDirective = (enabled: boolean) => {
                // Clean up existing listener if any
                if (el._alphaOnlyCleanup) {
                    el._alphaOnlyCleanup();
                    el._alphaOnlyCleanup = null;
                }
                
                if (!enabled) {
                    el._alphaOnlyEnabled = false;
                    return;
                }
                
                setTimeout(() => {
                    // Get native <input> from ion-input, ion-textarea, or regular input
                    const inputEl = el.tagName === "ION-INPUT" || el.tagName === "ION-TEXTAREA"
                        ? el.el?.querySelector("input, textarea")
                        : el;

                    if (!inputEl) return;
                    
                    const handleInput = (e: Event) => {
                        const target = e.target as HTMLInputElement;
                        // Allow only alphabetic characters (A-Z, a-z) and spaces
                        const cleaned = target.value.replaceAll(/[^a-zA-Z ]/g, "");
                        if (target.value !== cleaned) {
                            target.value = cleaned;
                            target.dispatchEvent(new Event("input")); // Ensure v-model updates
                        }
                    };
                    
                    inputEl.addEventListener("input", handleInput);
                    el._alphaOnlyCleanup = () => inputEl.removeEventListener("input", handleInput);
                    el._alphaOnlyEnabled = true;
                }, 100);
            };
            
            setupDirective(binding.value);
        }
    },

    unmounted(el) {
        if (el._alphaOnlyCleanup) {
            el._alphaOnlyCleanup();
        }
    },
};

