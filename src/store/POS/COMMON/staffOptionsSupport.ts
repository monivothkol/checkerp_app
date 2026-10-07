import type { LookupRequest, StaffLookup, StaffLookupResponse } from "@/models/POS/COMMON/lookups";
import type { IRequest } from "@/services/api/api-request-option";

/**
 * Shared "staff dropdown" plumbing: load the active staff list into a store and
 * map it to {id, name} options. Reused by any screen with a staff picker
 * (leave balances, schedule assign, …) so the boilerplate lives in one place.
 */

export function toStaffOptions(staff: StaffLookup[]): { id: string; name: string }[] {
    return staff.map((s) => ({
        id: s.staffId,
        name: s.staffName ?? [s.firstName, s.lastName].filter(Boolean).join(" ")
    }));
}

export function loadStaffOptions(
    state: { staff: StaffLookup[]; loadingStaff: boolean },
    api: IRequest<LookupRequest, StaffLookupResponse>
): void {
    state.loadingStaff = true;
    api.request({
        dataBody: { pageNo: 1, pageSize: 200 },
        listener: {
            onSuccess: (p) => { state.staff = p.staffList ?? []; state.loadingStaff = false; },
            onFail: () => { state.loadingStaff = false; }
        }
    });
}
