import { type Directive } from "vue";

export const khmerOnly: Directive = {
    created(el, binding) {
        el._khmerOnlyEnabled = false;
        el._khmerOnlyCleanup = null;

        const setupDirective = (enabled: boolean) => {
            // Clean up existing listener if any
            if (el._khmerOnlyCleanup) {
                el._khmerOnlyCleanup();
                el._khmerOnlyCleanup = null;
            }

            if (!enabled) {
                el._khmerOnlyEnabled = false;
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
                    // Allow only khmer characters (letters, numbers, spaces, and common punctuation)
                    const cleaned = target.value.replace(/[^\u1780-\u17FF\s]/g, "");
                    if (target.value !== cleaned) {
                        target.value = cleaned;
                        target.dispatchEvent(new Event("input")); // Ensure v-model updates
                    }
                };

                inputEl.addEventListener("input", handleInput);
                el._khmerOnlyCleanup = () => inputEl.removeEventListener("input", handleInput);
                el._khmerOnlyEnabled = true;
            }, 100);
        };

        setupDirective(binding.value);
    },

    updated(el, binding) {
        if (binding.value !== binding.oldValue) {
            const setupDirective = (enabled: boolean) => {
                // Clean up existing listener if any
                if (el._khmerOnlyCleanup) {
                    el._khmerOnlyCleanup();
                    el._khmerOnlyCleanup = null;
                }

                if (!enabled) {
                    el._khmerOnlyEnabled = false;
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
                        // Allow only khmer characters (letters, numbers, spaces, and common punctuation)
                        const cleaned = target.value.replace(/[^a-zA-Z0-9\s.,!?'"()-]/g, "");
                        if (target.value !== cleaned) {
                            target.value = cleaned;
                            target.dispatchEvent(new Event("input")); // Ensure v-model updates
                        }
                    };

                    inputEl.addEventListener("input", handleInput);
                    el._khmerOnlyCleanup = () => inputEl.removeEventListener("input", handleInput);
                    el._khmerOnlyEnabled = true;
                }, 100);
            };

            setupDirective(binding.value);
        }
    },

    unmounted(el) {
        if (el._khmerOnlyCleanup) {
            el._khmerOnlyCleanup();
        }
    },
};
