import { type Directive } from "vue";

export const inputFocus: Directive = {
    created(el, binding) {
        el._inputFocusEnabled = false;
        
        const setupDirective = (enabled: boolean) => {
            el._inputFocusEnabled = enabled;
            
            if (!enabled) return;
            
            setTimeout(() => {
                // Get native <input> from ion-input, ion-textarea, or regular input
                const inputEl = el.tagName === "ION-INPUT" || el.tagName === "ION-TEXTAREA"
                    ? el.el?.querySelector("input, textarea")
                    : el;
                
                if (!inputEl) return;
                
                // Focus the input element
                inputEl.focus();
            }, 100);
        };
        
        setupDirective(binding.value);
    },

    updated(el, binding) {
        if (binding.value !== binding.oldValue) {
            const setupDirective = (enabled: boolean) => {
                el._inputFocusEnabled = enabled;
                
                if (!enabled) return;
                
                setTimeout(() => {
                    // Get native <input> from ion-input, ion-textarea, or regular input
                    const inputEl = el.tagName === "ION-INPUT" || el.tagName === "ION-TEXTAREA"
                        ? el.el?.querySelector("input, textarea")
                        : el;
                    
                    if (!inputEl) return;
                    
                    // Focus the input element
                    inputEl.focus();
                }, 100);
            };
            
            setupDirective(binding.value);
        }
    },
};
