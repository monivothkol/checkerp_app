import { defineStore } from "pinia";
import POP from "@/core/utilities/pop";
import CreateLeaveType from "@/services/api/LVM/createLeaveType";
import UpdateLeaveType from "@/services/api/LVM/updateLeaveType";
import type { LeaveType } from "@/models/POS/LVM/LVM20000";

/** Store for the leave-type create/edit modal (LVM20000I02/I03): form state + save. */
export const LeaveTypeCreateModalStore = defineStore("LeaveTypeCreateModalStore", {
    state: () => ({
        saving: false,
        saved: false,
        editId: "" as string,
        form: {
            name: "",
            nameKhmer: "",
            code: "",
            defaultDaysPerYear: 0 as number | null,
            isPaid: true,
            requiresAttachment: false,
            maxConsecutiveDays: null as number | null
        },
        createApi: CreateLeaveType.getInstance(),
        updateApi: UpdateLeaveType.getInstance()
    }),
    getters: {
        canSave(state): boolean {
            return !!state.form.name.trim() && !!state.form.code.trim() && Number(state.form.defaultDaysPerYear ?? -1) >= 0;
        },
        isEdit(state): boolean {
            return !!state.editId;
        }
    },
    actions: {
        /** Reset the form (store is a singleton reused across modal opens). Pass a
         *  type to edit it; code is read-only in edit mode. */
        init(type?: LeaveType) {
            this.saving = false;
            this.saved = false;
            this.editId = type?.leaveTypeId ?? "";
            this.form = {
                name: type?.name ?? "",
                nameKhmer: type?.nameKhmer ?? "",
                code: type?.code ?? "",
                defaultDaysPerYear: type?.defaultDaysPerYear ?? 0,
                isPaid: type?.isPaid ?? true,
                requiresAttachment: type?.requiresAttachment ?? false,
                maxConsecutiveDays: type?.maxConsecutiveDays ?? null
            };
        },
        setCode(raw: string) {
            this.form.code = String(raw ?? "").toUpperCase();
        },
        /** Save the leave type (create or update); on success sets `saved` (modal watches it to $emit ok). */
        save(failTitle: string) {
            if (!this.canSave || this.saving) return;
            this.saving = true;
            const listener = {
                onSuccess: () => { this.saving = false; this.saved = true; },
                onFail: (error: { message?: string; code?: string }) => {
                    this.saving = false;
                    POP.alert({ title: failTitle, status: "error", content: error?.message, errorCode: error?.code });
                }
            };
            const common = {
                name: this.form.name.trim(),
                nameKhmer: this.form.nameKhmer.trim() || undefined,
                defaultDaysPerYear: Number(this.form.defaultDaysPerYear ?? 0),
                isPaid: this.form.isPaid,
                requiresAttachment: this.form.requiresAttachment,
                maxConsecutiveDays: this.form.maxConsecutiveDays ?? undefined
            };
            if (this.editId) {
                this.updateApi.request({ dataBody: { leaveTypeId: this.editId, ...common }, listener });
            } else {
                this.createApi.request({ dataBody: { code: this.form.code.trim(), ...common }, listener });
            }
        }
    }
});
