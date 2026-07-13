import { type Directive } from "vue";

export const restrictEmoji: Directive = {
    created(el, binding) {
        el._restrictEmojiEnabled = false;
        el._restrictEmojiCleanup = null;
        
        const setupDirective = (enabled: boolean) => {
            // Clean up existing listener if any
            if (el._restrictEmojiCleanup) {
                el._restrictEmojiCleanup();
                el._restrictEmojiCleanup = null;
            }
            
            if (!enabled) {
                el._restrictEmojiEnabled = false;
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
                    const cleaned = target.value.replace(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g, "");
                    if (target.value !== cleaned) {
                        target.value = cleaned;
                        target.dispatchEvent(new Event("input")); // Ensure v-model updates
                    }
                };
                
                inputEl.addEventListener("input", handleInput);
                el._restrictEmojiCleanup = () => inputEl.removeEventListener("input", handleInput);
                el._restrictEmojiEnabled = true;
            }, 100);
        };
        
        setupDirective(binding.value);
    },

    updated(el, binding) {
        if (binding.value !== binding.oldValue) {
            const setupDirective = (enabled: boolean) => {
                // Clean up existing listener if any
                if (el._restrictEmojiCleanup) {
                    el._restrictEmojiCleanup();
                    el._restrictEmojiCleanup = null;
                }
                
                if (!enabled) {
                    el._restrictEmojiEnabled = false;
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
                        const cleaned = target.value.replace(/\p{Extended_Pictographic}/gu, "");
                        if (target.value !== cleaned) {
                            target.value = cleaned;
                            target.dispatchEvent(new Event("input")); // Ensure v-model updates
                        }
                    };
                    
                    inputEl.addEventListener("input", handleInput);
                    el._restrictEmojiCleanup = () => inputEl.removeEventListener("input", handleInput);
                    el._restrictEmojiEnabled = true;
                }, 100);
            };
            
            setupDirective(binding.value);
        }
    },

    unmounted(el) {
        if (el._restrictEmojiCleanup) {
            el._restrictEmojiCleanup();
        }
    },
};
