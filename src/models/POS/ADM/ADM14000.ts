/** User detail — ADM14000. Tolerant read: detail may nest under `user`. */

export interface UserDetail {
    userId?: string;
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    roleId?: string;
    roleName?: string;
    roleIsAdmin?: boolean;
    staffId?: string;
    staffName?: string;
    authProvider?: string;
    lastLoginAt?: string;
    passwordChangedAt?: string;
    isActive?: boolean;
}

export interface ADM14000Response extends UserDetail {
    user?: UserDetail;
}
