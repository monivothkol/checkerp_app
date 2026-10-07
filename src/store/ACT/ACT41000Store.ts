import { defineStore } from "pinia";
import RetrievePaymentMappings from "@/services/api/ACT/retrievePaymentMappings";
import SavePaymentMappings from "@/services/api/ACT/savePaymentMappings";
import { loadMappingRows, saveMappingRows } from "@/store/ACT/mappingStoreSupport";
import type { PaymentMappingRow, CashAccountOption } from "@/models/ACT/ACT41000";

/** ACT41000 payment mapping store: load methods + their account, edit locally, save. */
export const ACT41000Store = defineStore("ACT41000Store", {
    state: () => ({
        loading: false,
        saving: false,
        rows: [] as PaymentMappingRow[],
        accounts: [] as CashAccountOption[],
        listApi: RetrievePaymentMappings.getInstance(),
        saveApi: SavePaymentMappings.getInstance()
    }),
    actions: {
        load() {
            loadMappingRows(this, this.listApi, (p) => p.mappingList, (p) => p.accountList);
        },
        save(failTitle: string, done?: () => void) {
            const payload = { mappings: this.rows.map((r) => ({ paymentMethodId: r.paymentMethodId, accountCode: r.accountCode ?? "" })) };
            saveMappingRows(this, this.saveApi, payload, () => this.load(), failTitle, done);
        }
    }
});
