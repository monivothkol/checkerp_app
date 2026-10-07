import { defineStore } from "pinia";
import POP from "@/core/utilities/pop";
import CreateHoliday from "@/services/api/LVM/createHoliday";

/** Store for the holiday create modal (LVM31000): form state + save. */
export const HolidayCreateModalStore = defineStore("HolidayCreateModalStore", {
    state: () => ({
        saving: false,
        saved: false,
        form: {
            name: "",
            nameKhmer: "",
            date: undefined as string | undefined,
            isRecurring: false
        },
        createApi: CreateHoliday.getInstance()
    }),
    getters: {
        canSave(state): boolean {
            return !!state.form.name.trim() && !!state.form.date;
        }
    },
    actions: {
        /** Reset the form (store is a singleton reused across modal opens). */
        init() {
            this.saving = false;
            this.saved = false;
            this.form = { name: "", nameKhmer: "", date: undefined, isRecurring: false };
        },
        /** Save the holiday; on success sets `saved` (modal watches it to $emit ok). */
        save(failTitle: string) {
            if (!this.canSave || this.saving) return;
            this.saving = true;
            this.createApi.request({
                dataBody: {
                    name: this.form.name.trim(),
                    nameKhmer: this.form.nameKhmer.trim() || undefined,
                    date: this.form.date,
                    isRecurring: this.form.isRecurring
                },
                listener: {
                    onSuccess: () => {
                        this.saving = false;
                        this.saved = true;
                    },
                    onFail: (error: { message?: string; code?: string }) => {
                        this.saving = false;
                        POP.alert({ title: failTitle, status: "error", content: error?.message, errorCode: error?.code });
                    }
                }
            });
        }
    }
});
