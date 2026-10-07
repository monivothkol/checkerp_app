import { defineStore } from "pinia";
import RetrieveSyncPreview from "@/services/api/ACT/retrieveSyncPreview";
import RunAccountingSync from "@/services/api/ACT/runAccountingSync";
import RetrieveSyncStatus from "@/services/api/ACT/retrieveSyncStatus";
import RetrieveOpeningBalancePreview from "@/services/api/ACT/retrieveOpeningBalancePreview";
import PostOpeningBalance from "@/services/api/ACT/postOpeningBalance";
import POP from "@/core/utilities/pop";
import type { OpeningBalanceRow, SyncJobResponse, SyncReason, SyncTypeRow } from "@/models/ACT/ACT44000";

const POLL_MS = 1000;
// A timer handle is plumbing, not screen state — kept out of the reactive store.
let pollTimer: ReturnType<typeof setTimeout> | undefined;

/** Already-translated messages; the counts are filled in by the screen's i18n, not here. */
type SyncLabels = { done: (n: number) => string; partial: (n: number) => string; failed: string };

/**
 * ACT44000 accounting sync. Step 1 replays operations that never reached the ledger: the
 * request only STARTS a background job, and this store polls its progress once a second
 * (the status call reads memory on the server — no SQL — so polling costs nothing).
 * Step 2 posts the opening balance for whatever the replay could not explain.
 */
export const ACT44000Store = defineStore("ACT44000Store", {
    state: () => ({
        loading: false,
        syncing: false,
        posting: false,
        enabled: true,
        conversionDate: null as string | null,
        types: [] as SyncTypeRow[],
        totalMissing: 0,
        // progress of the running sync
        synced: 0,
        syncTotal: 0,
        unpostable: 0,
        currentType: null as string | null,
        reasons: [] as SyncReason[],
        // step 2
        countedCash: null as number | null,
        rows: [] as OpeningBalanceRow[],
        equityAccountCode: "",
        equityDelta: 0,
        previewApi: RetrieveSyncPreview.getInstance(),
        runApi: RunAccountingSync.getInstance(),
        statusApi: RetrieveSyncStatus.getInstance(),
        openingPreviewApi: RetrieveOpeningBalancePreview.getInstance(),
        openingPostApi: PostOpeningBalance.getInstance()
    }),
    getters: {
        /** 0-100 while a sync runs. */
        percent(state): number {
            return state.syncTotal > 0 ? Math.min(100, Math.round((state.synced / state.syncTotal) * 100)) : 0;
        },
        /** Nothing left that a sync could post — the opening balance may be posted. */
        inSync(state): boolean {
            return state.totalMissing === 0;
        },
        /** Any account whose ledger balance disagrees with what is really held. */
        hasGap(state): boolean {
            return state.rows.some((r) => Number(r.delta) !== 0);
        }
    },
    actions: {
        load() {
            this.loading = true;
            this.previewApi.request({
                dataBody: {},
                listener: {
                    onSuccess: (p) => {
                        this.enabled = p.enabled !== false;
                        this.conversionDate = p.conversionDate ?? null;
                        this.types = p.types ?? [];
                        this.totalMissing = Number(p.totalMissing ?? 0);
                        this.loading = false;
                        this.loadOpening();
                    },
                    onFail: () => { this.loading = false; }
                }
            });
        },
        loadOpening() {
            this.openingPreviewApi.request({
                dataBody: { countedCash: this.countedCash },
                listener: {
                    onSuccess: (p) => {
                        this.rows = p.rows ?? [];
                        this.equityAccountCode = p.equityAccountCode ?? "";
                        this.equityDelta = Number(p.equityDelta ?? 0);
                    },
                    onFail: () => { this.rows = []; }
                }
            });
        },
        /** Starts the background job, then follows it. */
        startSync(labels: SyncLabels) {
            if (this.syncing) return;
            this.syncing = true;
            this.synced = 0;
            this.unpostable = 0;
            this.reasons = [];
            this.syncTotal = this.totalMissing;
            this.runApi.request({
                dataBody: {},
                listener: {
                    onSuccess: (p) => this.onJob(p, labels),
                    onFail: () => this.stopSync(labels.failed)
                }
            });
        },
        /** A job started elsewhere (another tab, before a reload) is picked up, not restarted. */
        resume(labels: SyncLabels) {
            this.statusApi.request({
                dataBody: {},
                listener: {
                    onSuccess: (p) => {
                        if (p.state !== "RUNNING") return;
                        this.syncing = true;
                        this.onJob(p, labels);
                    }
                }
            });
        },
        poll(labels: SyncLabels) {
            pollTimer = setTimeout(() => {
                this.statusApi.request({
                    dataBody: {},
                    listener: {
                        onSuccess: (p) => this.onJob(p, labels),
                        onFail: () => this.stopSync(labels.failed)
                    }
                });
            }, POLL_MS);
        },
        onJob(p: SyncJobResponse, labels: SyncLabels) {
            this.synced = Number(p.posted ?? 0);
            this.unpostable = Number(p.unpostable ?? 0);
            this.currentType = p.type ?? null;
            this.reasons = p.reasons ?? [];
            if (Number(p.total ?? 0) > 0) this.syncTotal = Number(p.total);
            if (p.state === "RUNNING") {
                this.poll(labels);
                return;
            }
            if (p.state === "FAILED") {
                this.stopSync(labels.failed);
                return;
            }
            this.syncing = false;
            this.currentType = null;
            POP.openNotification(this.unpostable > 0
                ? { type: "warning", content: labels.partial(this.unpostable) }
                : { type: "success", content: labels.done(this.synced) });
            this.load();
        },
        stopSync(message: string) {
            this.syncing = false;
            this.currentType = null;
            POP.openNotification({ type: "error", content: message });
            this.load();
        },
        /** Leaving the screen stops the polling; the job itself keeps running on the server. */
        dispose() {
            if (pollTimer) clearTimeout(pollTimer);
            pollTimer = undefined;
        },
        postOpening(labels: { done: (journalNo: string) => string; failed: string }) {
            this.posting = true;
            this.openingPostApi.request({
                dataBody: { countedCash: this.countedCash },
                enableLoading: true,
                listener: {
                    onSuccess: (p) => {
                        this.posting = false;
                        POP.openNotification({ type: "success", content: labels.done(p.journalNo ?? "") });
                        this.countedCash = null;
                        this.load();
                    },
                    onFail: () => {
                        this.posting = false;
                        POP.openNotification({ type: "error", content: labels.failed });
                    }
                }
            });
        }
    }
});
