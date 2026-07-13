import { type Directive } from "vue";

export const numberOnly: Directive = {
    created(el, binding) {
        el._numberOnlyEnabled = false;
        el._numberOnlyCleanup = null;
        
        const setupDirective = (enabled: boolean) => {
            // Clean up existing listener if any
            if (el._numberOnlyCleanup) {
                el._numberOnlyCleanup();
                el._numberOnlyCleanup = null;
            }
            
            if (!enabled) {
                el._numberOnlyEnabled = false;
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
                    const originalValue = target.value;
                    
                    // Allow only numbers (0-9), decimal point, and minus sign
                    // Remove any characters that are not numbers, decimal point, or minus sign
                    let cleaned = originalValue.replace(/[^0-9.-]/g, "");
                    
                    // Handle edge cases and validation
                    if (cleaned.length > 0) {
                        // Handle case where user types ".-" - remove the decimal
                        if (cleaned === ".-") {
                            cleaned = "-";
                        }
                        
                        // Prevent decimal point without any numbers
                        // Don't allow "." or "-." as standalone input
                        if (cleaned === "." || cleaned === "-.") {
                            // Remove the decimal point - user must enter numbers first
                            cleaned = cleaned.replace(".", "");
                        }
                        
                        // Handle multiple minus signs - keep only the first one if it's at the beginning
                        const minusCount = (cleaned.match(/-/g) || []).length;
                        if (minusCount > 1) {
                            const firstMinusIndex = cleaned.indexOf("-");
                            if (firstMinusIndex === 0) {
                                // Keep the first minus and remove others
                                cleaned = "-" + cleaned.substring(1).replace(/-/g, "");
                            } else {
                                // Remove all minus signs if none are at the beginning
                                cleaned = cleaned.replace(/-/g, "");
                            }
                        } else if (minusCount === 1 && cleaned.indexOf("-") !== 0) {
                            // Move minus to the beginning if it's not already there
                            cleaned = "-" + cleaned.replace(/-/g, "");
                        }
                        
                        // Handle multiple decimal points - keep only the first one
                        const decimalCount = (cleaned.match(/\./g) || []).length;
                        if (decimalCount > 1) {
                            const firstDecimalIndex = cleaned.indexOf(".");
                            cleaned = cleaned.substring(0, firstDecimalIndex + 1) + 
                                     cleaned.substring(firstDecimalIndex + 1).replace(/\./g, "");
                        }
                        
                        // Additional validation for decimal placement
                        // Only allow decimal if there's at least one digit before or after it
                        if (cleaned.includes(".")) {
                            const parts = cleaned.split(".");
                            const beforeDecimal = parts[0].replace("-", ""); // Remove minus to check digits
                            const afterDecimal = parts[1] || "";
                            
                            // If no digits before or after decimal, remove the decimal
                            if (beforeDecimal === "" && afterDecimal === "") {
                                cleaned = cleaned.replace(".", "");
                            }
                        }
                        
                        // Handle leading zeros for integers (but not for decimals)
                        if (cleaned.length > 1 && cleaned[0] === "0" && cleaned[1] !== "." && !cleaned.startsWith("-0.")) {
                            // Remove leading zeros unless it's "0" or starts with "0."
                            cleaned = cleaned.replace(/^(-?)0+/, "$1");
                            if (cleaned === "" || cleaned === "-") {
                                cleaned = cleaned + "0";
                            }
                        }
                        
                        // Handle negative leading zeros
                        if (cleaned.startsWith("-0") && cleaned.length > 2 && cleaned[2] !== ".") {
                            cleaned = "-" + cleaned.substring(2).replace(/^0+/, "") || "-0";
                        }
                    }
                    
                    if (originalValue !== cleaned) {
                        target.value = cleaned;
                        target.dispatchEvent(new Event("input")); // Ensure v-model updates
                    }
                };
                
                inputEl.addEventListener("input", handleInput);
                el._numberOnlyCleanup = () => inputEl.removeEventListener("input", handleInput);
                el._numberOnlyEnabled = true;
            }, 100);
        };
        
        setupDirective(binding.value);
    },

    updated(el, binding) {
        if (binding.value !== binding.oldValue) {
            const setupDirective = (enabled: boolean) => {
                // Clean up existing listener if any
                if (el._numberOnlyCleanup) {
                    el._numberOnlyCleanup();
                    el._numberOnlyCleanup = null;
                }
                
                if (!enabled) {
                    el._numberOnlyEnabled = false;
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
                        const originalValue = target.value;
                        
                        // Allow only numbers (0-9), decimal point, and minus sign
                        // Remove any characters that are not numbers, decimal point, or minus sign
                        let cleaned = originalValue.replace(/[^0-9.-]/g, "");
                        
                        // Handle edge cases and validation
                        if (cleaned.length > 0) {
                            // Handle case where user types ".-" - remove the decimal
                            if (cleaned === ".-") {
                                cleaned = "-";
                            }
                            
                            // Prevent decimal point without any numbers
                            // Don't allow "." or "-." as standalone input
                            if (cleaned === "." || cleaned === "-.") {
                                // Remove the decimal point - user must enter numbers first
                                cleaned = cleaned.replace(".", "");
                            }
                            
                            // Handle multiple minus signs - keep only the first one if it's at the beginning
                            const minusCount = (cleaned.match(/-/g) || []).length;
                            if (minusCount > 1) {
                                const firstMinusIndex = cleaned.indexOf("-");
                                if (firstMinusIndex === 0) {
                                    // Keep the first minus and remove others
                                    cleaned = "-" + cleaned.substring(1).replace(/-/g, "");
                                } else {
                                    // Remove all minus signs if none are at the beginning
                                    cleaned = cleaned.replace(/-/g, "");
                                }
                            } else if (minusCount === 1 && cleaned.indexOf("-") !== 0) {
                                // Move minus to the beginning if it's not already there
                                cleaned = "-" + cleaned.replace(/-/g, "");
                            }
                            
                            // Handle multiple decimal points - keep only the first one
                            const decimalCount = (cleaned.match(/\./g) || []).length;
                            if (decimalCount > 1) {
                                const firstDecimalIndex = cleaned.indexOf(".");
                                cleaned = cleaned.substring(0, firstDecimalIndex + 1) + 
                                         cleaned.substring(firstDecimalIndex + 1).replace(/\./g, "");
                            }
                            
                            // Additional validation for decimal placement
                            // Only allow decimal if there's at least one digit before or after it
                            if (cleaned.includes(".")) {
                                const parts = cleaned.split(".");
                                const beforeDecimal = parts[0].replace("-", ""); // Remove minus to check digits
                                const afterDecimal = parts[1] || "";
                                
                                // If no digits before or after decimal, remove the decimal
                                if (beforeDecimal === "" && afterDecimal === "") {
                                    cleaned = cleaned.replace(".", "");
                                }
                            }
                            
                            // Handle leading zeros for integers (but not for decimals)
                            if (cleaned.length > 1 && cleaned[0] === "0" && cleaned[1] !== "." && !cleaned.startsWith("-0.")) {
                                // Remove leading zeros unless it's "0" or starts with "0."
                                cleaned = cleaned.replace(/^(-?)0+/, "$1");
                                if (cleaned === "" || cleaned === "-") {
                                    cleaned = cleaned + "0";
                                }
                            }
                            
                            // Handle negative leading zeros
                            if (cleaned.startsWith("-0") && cleaned.length > 2 && cleaned[2] !== ".") {
                                cleaned = "-" + cleaned.substring(2).replace(/^0+/, "") || "-0";
                            }
                        }
                        
                        if (originalValue !== cleaned) {
                            target.value = cleaned;
                            target.dispatchEvent(new Event("input")); // Ensure v-model updates
                        }
                    };
                    
                    inputEl.addEventListener("input", handleInput);
                    el._numberOnlyCleanup = () => inputEl.removeEventListener("input", handleInput);
                    el._numberOnlyEnabled = true;
                }, 100);
            };
            
            setupDirective(binding.value);
        }
    },

    unmounted(el) {
        if (el._numberOnlyCleanup) {
            el._numberOnlyCleanup();
        }
    },
};
