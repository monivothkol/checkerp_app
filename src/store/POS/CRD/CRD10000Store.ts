import { defineStore } from "pinia";
import RetrieveCreditPolicyList from "@/services/api/CRD/retrieveCreditPolicyList";
import CreateCreditPolicy from "@/services/api/CRD/createCreditPolicy";
import UpdateCreditPolicy from "@/services/api/CRD/updateCreditPolicy";
import POP from "@/core/utilities/pop";
import type { CreditPolicyRow, CreditPolicySaveRequest } from "@/models/POS/CRD/CRD10000";

/** CRD10000 credit-policy (general credit condition) list store. */
export const CRD10000Store = defineStore("CRD10000Store", {
    state: () => ({
        rows: [] as CreditPolicyRow[],
        loading: false,
        listApi: RetrieveCreditPolicyList.getInstance(),
        createApi: CreateCreditPolicy.getInstance(),
        updateApi: UpdateCreditPolicy.getInstance()
    }),
    actions: {
        reload() {
            this.loading = true;
            this.listApi.request({
                dataBody: {},
                listener: {
                    onSuccess: (p) => { this.rows = p.creditPolicyList ?? []; this.loading = false; },
                    onFail: () => { this.rows = []; this.loading = false; }
                }
            });
        },
        /** Create or update (creditPolicyId present = update); resolves true on success. */
        save(payload: CreditPolicySaveRequest, failTitle: string): Promise<boolean> {
            const api = payload.creditPolicyId ? this.updateApi : this.createApi;
            return new Promise((resolve) => {
                api.request({
                    dataBody: payload,
                    listener: {
                        onSuccess: () => { this.reload(); resolve(true); },
                        onFail: (err) => {
                            POP.alert({ title: failTitle, status: "error", content: err?.message, errorCode: err?.code });
                            resolve(false);
                        }
                    }
                });
            });
        }
    }
});
