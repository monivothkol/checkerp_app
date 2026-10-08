import { defineStore } from "pinia";
import dayjs from "dayjs";
import POP from "@/core/utilities/pop";
import RetrieveDayOffCalendar from "@/services/api/ATD/retrieveDayOffCalendar";
import SaveDayOffs from "@/services/api/ATD/saveDayOffs";
import RetrieveDepartmentList from "@/services/api/DPM/retrieveDepartmentList";
import type { DayOffMark, DayOffStaff } from "@/models/POS/ATD/ATD60000";
import type { DepartmentRow } from "@/models/POS/DPM/DPM10000";

/** ATD60000 day-off calendar: one month of marks (optionally one department) + saving a date's marks. */
export const ATD60000Store = defineStore("ATD60000Store", {
    state: () => ({
        month: dayjs().format("YYYY-MM"),
        departmentId: undefined as string | undefined,
        departments: [] as DepartmentRow[],
        marks: [] as DayOffMark[],
        staff: [] as DayOffStaff[],
        loading: false,
        saving: false,
        /** Latest load wins (month/department can change while a load is in flight). */
        seq: 0,
        calendarApi: RetrieveDayOffCalendar.getInstance(),
        saveApi: SaveDayOffs.getInstance(),
        departmentApi: RetrieveDepartmentList.getInstance()
    }),
    getters: {
        /** date → the staff marked off that day. */
        byDate(state): Record<string, DayOffMark[]> {
            const map: Record<string, DayOffMark[]> = {};
            for (const m of state.marks) {
                map[m.date] ??= [];
                map[m.date].push(m);
            }
            return map;
        }
    },
    actions: {
        loadDepartments() {
            this.departmentApi.request({
                dataBody: { pageNo: 1, pageSize: 200 },
                listener: { onSuccess: (p) => { this.departments = p.departmentList ?? []; } }
            });
        },
        /** The month on screen, padded a week each side so the calendar's leading/trailing days show marks too. */
        load() {
            const first = dayjs(this.month + "-01");
            const seq = ++this.seq;
            this.loading = true;
            this.calendarApi.request({
                dataBody: {
                    startDate: first.subtract(7, "day").format("YYYY-MM-DD"),
                    endDate: first.endOf("month").add(7, "day").format("YYYY-MM-DD"),
                    departmentId: this.departmentId
                },
                listener: {
                    onSuccess: (p) => {
                        if (seq !== this.seq) return;
                        this.marks = p.dayOffList ?? [];
                        this.staff = p.staffList ?? [];
                        this.loading = false;
                    },
                    onFail: () => { if (seq === this.seq) this.loading = false; }
                }
            });
        },
        setMonth(month: string) {
            if (month === this.month) return;
            this.month = month;
            this.load();
        },
        setDepartment(departmentId: string | undefined) {
            this.departmentId = departmentId || undefined;
            this.load();
        },
        /** Save who is off on `date` (an empty list clears it); `failTitle` is the translated alert title. */
        save(date: string, staffIds: string[], repeatWeeks: number, failTitle: string, onDone?: () => void) {
            if (this.saving) return;
            this.saving = true;
            this.saveApi.request({
                dataBody: { date, staffIds, departmentId: this.departmentId, repeatWeeks },
                headers: { "Idempotency-Key": crypto.randomUUID() },
                listener: {
                    onSuccess: () => { this.saving = false; this.load(); onDone?.(); },
                    onFail: (e) => {
                        this.saving = false;
                        POP.alert({ status: "error", title: failTitle, content: e?.message, errorCode: e?.code });
                    }
                }
            });
        }
    }
});
