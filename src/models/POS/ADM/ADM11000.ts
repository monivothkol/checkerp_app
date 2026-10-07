/** User create flow — ADM11000 (form) → ADM12000 (confirm) → ADM13000. */

/** Role dropdown option (from ADM20000 roleList). */
export interface RoleOption {
    roleId: string;
    roleName: string;
    isAdmin?: boolean;
}

export interface UserCreateForm {
    username: string;
    /** Sent as the new user's login name; "username" is overwritten server-side
     *  with the caller's name (audit context), so it can't carry input. */
    loginUsername?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    roleId?: string;
    staffId?: string;
}

/** Human-readable summary shown on the confirm screen. */
export interface UserDraftDisplay {
    name: string;
    username: string;
    email: string;
    phone: string;
    roleName: string;
    staffName: string;
}

/** Draft stashed in ModuleFlowStore between ADM11000 → ADM12000 → ADM13000.
 * Password never rides in the draft — it stays in UserCreateSecret in memory. */
export interface UserDraft {
    payload: UserCreateForm;
    idempotencyKey: string;
    display: UserDraftDisplay;
}

export interface ADM11000CreateResponse {
    userId?: string;
    username?: string;
}

/** Result stashed for the ADM13000 success screen. */
export interface UserResult {
    userId?: string;
    username?: string;
    name: string;
}
