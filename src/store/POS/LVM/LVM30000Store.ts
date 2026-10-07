import { defineStore } from "pinia";
import RetrieveHolidayList from "@/services/api/LVM/retrieveHolidayList";
import type { Holiday } from "@/models/POS/LVM/LVM30000";

/** LVM30000 holiday list store: year filter + holiday list load. */
export const LVM30000Store = defineStore("LVM30000Store", {
    state: () => ({
        yearValue: String(new Date().getFullYear()),
        rows: [] as Holiday[],
        loading: false,
        holidayApi: RetrieveHolidayList.getInstance()
    }),
    actions: {
        reload() {
            this.loading = true;
            this.holidayApi.request({
                dataBody: { year: Number(this.yearValue) },
                listener: {
                    onSuccess: (p) => { this.rows = p.holidayList ?? []; this.loading = false; },
                    onFail: () => { this.rows = []; this.loading = false; }
                }
            });
        }
    }
});
