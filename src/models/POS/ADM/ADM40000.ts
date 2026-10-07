/** Store operation settings — ADM40000 (load) + ADM41000 (save). */

export interface StoreOperationSettings {
    totalFloors?: number;
    hasTableNumber?: boolean;
    totalTables?: number;
    enableSequenceOrdering?: boolean;
    sequenceNumber?: number;
    enablePrinting?: boolean;
    notes?: string;
}
