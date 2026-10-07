/** Role screens (ADM20000-26000) shared flow types. Flow key "ADMR".
 * Only the draft/result shapes the confirm/result screens consume are
 * modeled here — the role list/create/detail screens keep their own inline
 * interfaces. */

export interface RoleFormDraft {
    roleName: string;
    description: string;
}

export interface RolePermissionLabel {
    code: string;
    name: string;
}

/** Draft stashed between ADM21000 → ADM22000. */
export interface RoleDraft {
    form: RoleFormDraft;
    selected: string[];
    labels: RolePermissionLabel[];
    idempotencyKey: string;
}

/** Result stashed for the ADM23000 success screen (returned by ADM21000). */
export interface RoleCreateResult {
    roleCode?: string;
    roleName?: string;
}

export interface RolePermission {
    permissionCode: string;
    permissionName: string;
    resource: string;
    action: string;
}

export interface RoleDetail {
    roleId?: string;
    roleCode?: string;
    roleName: string;
    description?: string;
    isAdmin?: boolean;
    isSystemRole?: boolean;
    isActive?: boolean;
    permissionList?: RolePermission[];
}

export interface ADM24000Response extends RoleDetail {}
