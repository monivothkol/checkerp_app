/** DPM10000I01 — department list (recipe module DPM). */
export interface DepartmentRow {
    departmentId: string;
    departmentCode?: string;
    departmentName?: string;
    isActive?: boolean;
}

export interface DPM10000Request {
    searchKeyword?: string;
    pageNo?: number;
    pageSize?: number;
}

export interface DPM10000Response {
    totalCount?: number;
    departmentList: DepartmentRow[];
}
