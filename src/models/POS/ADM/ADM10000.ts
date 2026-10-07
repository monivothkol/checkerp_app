/** User list — ADM10000. */

export interface UserRow {
    userId: string;
    username: string;
    fullName?: string;
    roleName?: string;
    roleIsAdmin?: boolean;
    staffName?: string;
    lastLoginAt?: string;
    isActive?: boolean;
}

export interface ADM10000Request {
    searchKeyword?: string;
    isActive?: string;
    pageNo?: number;
    pageSize?: number;
}

export interface ADM10000Response {
    totalCount: number;
    userList: UserRow[];
}
