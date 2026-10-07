import { defineStore } from "pinia";
import RetrieveAccountList from "@/services/api/ACT/retrieveAccountList";
import CreateJournalEntry from "@/services/api/ACT/createJournalEntry";
import POP from "@/core/utilities/pop";
import ReferenceData from "@/core/modules/reference-data";
import type { ActAccount } from "@/models/ACT/ACT40000";

const BASE_CURRENCY = "USD";

export interface EntryLine {
    accountCode: string | undefined;
    description: string;
    currency: string;
    debitAmount: number | null;
    creditAmount: number | null;
}

const emptyLine = (): EntryLine => ({
    accountCode: undefined,
    description: "",
    currency: BASE_CURRENCY,
    debitAmount: null,
    creditAmount: null
});

/** ACT20200 journal-create modal store: form state, account lookup, and the post write. */
export const ACT20200Store = defineStore("ACT20200Store", {
    state: () => ({
        saving: false,
        entryDate: new Date().toISOString().slice(0, 10),
        description: "",
        accounts: [] as ActAccount[],
        secondaryCurrency: "",
        exchangeRate: 0,
        lines: [emptyLine(), emptyLine()] as EntryLine[],
        savedJournalNo: null as string | null,
        accountApi: RetrieveAccountList.getInstance(),
        createApi: CreateJournalEntry.getInstance()
    }),
    getters: {
        // Manual entries cannot touch header or system-restricted accounts.
        accountOptions(state) {
            return state.accounts
                .filter((a) => !a.isHeader && !a.isRestricted && a.isActive)
                .map((a) => ({ value: a.accountCode, label: `${a.accountCode} · ${a.accountName}` }));
        },
        currencyOptions(state): { value: string; label: string }[] {
            const codes = [BASE_CURRENCY, state.secondaryCurrency].filter((c, i, a) => !!c && a.indexOf(c) === i);
            return codes.map((c) => ({ value: c, label: c }));
        },
        // The ledger balances in USD: a secondary-currency amount is divided by the entry's rate.
        toBase(state): (amount: number | null, currency: string) => number {
            return (amount, currency) => {
                const v = Number(amount || 0);
                if (!currency || currency === BASE_CURRENCY) { return v; }
                return state.exchangeRate > 0 ? Math.round((v / state.exchangeRate) * 100) / 100 : 0;
            };
        },
        totalDebit(state): number {
            return state.lines.reduce((s, l) => s + this.toBase(l.debitAmount, l.currency), 0);
        },
        totalCredit(state): number {
            return state.lines.reduce((s, l) => s + this.toBase(l.creditAmount, l.currency), 0);
        },
        needsRate(state): boolean {
            return state.lines.some((l) => !!l.currency && l.currency !== BASE_CURRENCY);
        },
        balanced(): boolean {
            return this.totalDebit > 0 && Math.abs(this.totalDebit - this.totalCredit) < 0.005;
        },
        valid(state): boolean {
            return (
                !!state.entryDate &&
                this.balanced &&
                (!this.needsRate || state.exchangeRate > 0) &&
                state.lines.every(
                    (l) => !!l.accountCode && (Number(l.debitAmount || 0) > 0) !== (Number(l.creditAmount || 0) > 0)
                )
            );
        }
    },
    actions: {
        /** Reset the form to a blank two-line entry (the store is a singleton across modal opens). */
        reset() {
            this.saving = false;
            this.entryDate = new Date().toISOString().slice(0, 10);
            this.description = "";
            this.lines = [emptyLine(), emptyLine()];
            this.savedJournalNo = null;
        },
        /** Secondary currency + rate come from the cached store settings; the rate stays editable per entry. */
        async loadCurrency() {
            const ref = await ReferenceData.get();
            this.secondaryCurrency = ref.currency?.secondaryCurrency ?? "";
            this.exchangeRate = Number(ref.currency?.exchangeRate) || 0;
        },
        loadAccounts() {
            this.accountApi.request({
                dataBody: {},
                listener: {
                    onSuccess: (p) => { this.accounts = p.accountList ?? []; },
                    onFail: () => { this.accounts = []; }
                }
            });
        },
        onAmount(i: number, side: "debit" | "credit") {
            // A line is debit XOR credit — typing one side clears the other.
            if (side === "debit" && Number(this.lines[i].debitAmount || 0) > 0) {
                this.lines[i].creditAmount = null;
            } else if (side === "credit" && Number(this.lines[i].creditAmount || 0) > 0) {
                this.lines[i].debitAmount = null;
            }
        },
        addLine() {
            this.lines.push(emptyLine());
        },
        removeLine(i: number) {
            this.lines.splice(i, 1);
        },
        /** Post the entry; `labels` are already-translated (i18n stays in the screen).
         *  On success sets `savedJournalNo` — the screen watches it and emits ok. */
        save(labels: { posted: string; failed: string }) {
            this.saving = true;
            const lineList = this.lines.map((l) => ({
                accountCode: l.accountCode,
                description: l.description,
                currency: l.currency,
                debitAmount: Number(l.debitAmount || 0),
                creditAmount: Number(l.creditAmount || 0)
            }));
            this.createApi.request({
                dataBody: { entryDate: this.entryDate, description: this.description, exchangeRate: this.exchangeRate, lineList },
                listener: {
                    onSuccess: (p) => {
                        this.saving = false;
                        POP.openNotification({ type: "success", content: `${labels.posted} ${p.journalNo ?? ""}` });
                        this.savedJournalNo = p.journalNo ?? "";
                    },
                    onFail: (e) => {
                        this.saving = false;
                        POP.openNotification({ type: "error", content: e?.message ?? labels.failed });
                    }
                }
            });
        }
    }
});
