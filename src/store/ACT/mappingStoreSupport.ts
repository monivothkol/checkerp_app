import POP from "@/core/utilities/pop";
import type { IRequest } from "@/services/api/api-request-option";

/**
 * Shared load/save for the account-mapping config screens (ACT41000 payment
 * mapping, ACT42000 expense route, ACT43000 posting rules) — they differ only in
 * the response list key, the row fields, and the save-payload wrapper, passed in
 * as callbacks. Keeps the three stores from repeating the same request plumbing.
 */

type MappingRow = { accountCode?: string | null };

/** Load rows + account options: normalize a null accountCode to '' so the <select> binds. */
export function loadMappingRows<R extends MappingRow, Res>(
    state: { loading: boolean; rows: R[]; accounts: unknown[] },
    api: IRequest<Record<string, never>, Res>,
    rowsOf: (p: Res) => R[] | undefined,
    accountsOf: (p: Res) => unknown[] | undefined
): void {
    state.loading = true;
    api.request({
        dataBody: {},
        listener: {
            onSuccess: (p) => {
                state.rows = (rowsOf(p) ?? []).map((r) => ({ ...r, accountCode: r.accountCode ?? "" }));
                state.accounts = accountsOf(p) ?? [];
                state.loading = false;
            },
            onFail: () => { state.rows = []; state.accounts = []; state.loading = false; }
        }
    });
}

/** Save the built payload, reload on success, alert on failure. */
export function saveMappingRows<Req, Res>(
    state: { saving: boolean },
    api: IRequest<Req, Res>,
    payload: Req,
    reload: () => void,
    failTitle: string,
    done?: () => void
): void {
    if (state.saving) return;
    state.saving = true;
    api.request({
        dataBody: payload,
        listener: {
            onSuccess: () => { state.saving = false; reload(); done?.(); },
            onFail: (e) => {
                state.saving = false;
                POP.alert({ title: failTitle, status: "error", content: e?.message, errorCode: e?.code });
            }
        }
    });
}
