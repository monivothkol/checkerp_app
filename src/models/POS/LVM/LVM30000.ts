/** Company holidays: list (LVM30000) and create (LVM31000). */

export interface Holiday {
    holidayId: string;
    name: string;
    nameKhmer?: string;
    date?: string;
    isRecurring?: boolean;
    year?: number;
}

export interface LVM30000Request {
    year: number;
}

export interface LVM30000Response {
    holidayList: Holiday[];
}

export interface LVM31000Request {
    name: string;
    nameKhmer?: string;
    date?: string;
    isRecurring: boolean;
}
