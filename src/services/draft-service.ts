import { BizCheckMobileProperties, BizCheckMobileLogger } from "@/shared/bizcheckmobile";
import debounce from "lodash.debounce";

export interface DraftRecord {
    data: any;
    timestamp: string;
}

export default class DraftService {
    private static instance: DraftService;
    private static readonly KEY_PREFIX = "FORM_DRAFT_";
    private static readonly REGISTRY_KEY = "FORM_DRAFT_REGISTRY";

    private constructor() { }

    static getInstance(): DraftService {
        if (!this.instance) {
            this.instance = new DraftService();
        }
        return this.instance;
    }

    private getStorageKey(key: string): string {
        return `${DraftService.KEY_PREFIX}${key}`;
    }

    /**
     * Maintain a registry of all keys that have at least one draft.
     */
    private updateRegistry(key: string, add: boolean): void {
        const registry = this.getRegistry();
        const index = registry.indexOf(key);

        if (add && index === -1) {
            registry.push(key);
            BizCheckMobileProperties.set(DraftService.REGISTRY_KEY, JSON.stringify(registry));
        } else if (!add && index !== -1) {
            registry.splice(index, 1);
            if (registry.length === 0) {
                BizCheckMobileProperties.remove(DraftService.REGISTRY_KEY);
            } else {
                BizCheckMobileProperties.set(DraftService.REGISTRY_KEY, JSON.stringify(registry));
            }
        }
    }

    /**
     * Get a list of all form keys that have active drafts.
     */
    getRegistry(): string[] {
        const raw = BizCheckMobileProperties.get(DraftService.REGISTRY_KEY);
        if (!raw) return [];
        try {
            return JSON.parse(raw);
        } catch (e) {
            return [];
        }
    }

    /**
     * Get all drafts for all registered forms.
     * Returns a map of Key -> DraftRecord[]
     */
    getAllDrafts(): Record<string, DraftRecord[]> {
        const registry = this.getRegistry();
        const result: Record<string, DraftRecord[]> = {};
        registry.forEach(key => {
            result[key] = this.getAll(key);
        });
        return result;
    }

    /**
     * Save a draft.
     * @param key Unique identifier for the form
     * @param data Form data to save
     * @param maxLength Maximum number of records to keep
     * @param timestamp The creation timestamp (Session ID)
     */
    save = debounce((key: string, data: any, maxLength, timestamp: string): void => {
        const storageKey = this.getStorageKey(key);
        const drafts = this.getAll(key);

        const recordIndex = drafts.findIndex(d => d.timestamp === timestamp);

        if (recordIndex !== -1) {
            // Update existing session draft
            drafts[recordIndex].data = data;
        } else {
            // Create new record
            drafts.unshift({ data, timestamp });

            // Trim to max length
            if (drafts.length > maxLength) {
                drafts.splice(maxLength);
            }

            // Register this form key
            this.updateRegistry(key, true);
        }

        BizCheckMobileProperties.set(storageKey, JSON.stringify(drafts));
    }, 1000);

    /**
     * Cancel any pending debounced save
     */
    cancelSave(): void {
        this.save.cancel();
    }

    /**
     * Check if a form has any drafts
     */
    hasDraft(key: string): boolean {
        return this.getAll(key).length > 0;
    }

    /**
     * Get the count of drafts for a form
     */
    getDraftCount(key: string): number {
        return this.getAll(key).length;
    }

    /**
     * Get the latest draft record
     */
    getLatest(key: string): DraftRecord | null {
        const drafts = this.getAll(key);
        return drafts.length > 0 ? drafts[0] : null;
    }

    /**
     * Get all draft records for a key
     */
    getAll(key: string): DraftRecord[] {
        const raw = BizCheckMobileProperties.get(this.getStorageKey(key));
        if (!raw) return [];
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [parsed]; // Support legacy single-object format
        } catch (e) {
            return [];
        }
    }

    /**
     * Clear all drafts for a specific key
     */
    clear(key: string): void {
        BizCheckMobileLogger.log("key stroage form=======>", this.getStorageKey(key), key);
        BizCheckMobileProperties.remove(this.getStorageKey(key));
        this.updateRegistry(key, false);
    }

    /**
     * Clear every single draft in the system (Security cleanup)
     */
    clearAllDrafts(): void {
        const registry = this.getRegistry();
        registry.forEach(key => {
            BizCheckMobileProperties.remove(this.getStorageKey(key));
        });
        BizCheckMobileProperties.remove(DraftService.REGISTRY_KEY);
    }

    /**
     * Remove a specific draft record by timestamp
     */
    removeRecord(key: string, timestamp: string): void {
        const storageKey = this.getStorageKey(key);
        const drafts = this.getAll(key).filter(d => d.timestamp !== timestamp);
        if (drafts.length === 0) {
            this.clear(key); // clear() also handles registry update
        } else {
            BizCheckMobileProperties.set(storageKey, JSON.stringify(drafts));
        }
    }
}
