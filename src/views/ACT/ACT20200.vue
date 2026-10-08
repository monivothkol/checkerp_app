<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/ACT20000" />
		<ion-content>
			<ion-list class="scr_list" lines="full">
				<ion-item>
					<ion-input v-model="store.entryDate" type="date" :label="`${tr('DATE')} *`" label-placement="stacked" />
				</ion-item>
				<ion-item>
					<ion-input v-model="store.description" :label="tr('DESCRIPTION')" label-placement="stacked" :placeholder="tr('DESC_PH')" />
				</ion-item>
				<ion-item v-if="store.secondaryCurrency">
					<NumberInput v-model="store.exchangeRate" min="0"
						:label="`${tr('RATE')}${store.needsRate ? ' *' : ''} (1 USD = ? ${store.secondaryCurrency})`" label-placement="stacked" />
				</ion-item>
			</ion-list>

			<ion-list v-for="(line, i) in store.lines" :key="i" class="scr_list je_line" lines="full">
				<ion-list-header>
					<ion-label>{{ tr("ACCOUNT") }} {{ i + 1 }}</ion-label>
					<ion-button color="danger" :disabled="store.lines.length <= 2" @click="store.removeLine(i)">{{ tr("REMOVE") }}</ion-button>
				</ion-list-header>
				<ion-item>
					<ion-label><p>{{ tr("ACCOUNT") }} *</p><h3>{{ accountLabel(line.accountCode) || tr("ACCOUNT_PH") }}</h3></ion-label>
				</ion-item>
				<SearchPickField :options="matchAccounts(accountKw[i])" :placeholder="tr('ACCOUNT_PH')"
					@search="(v) => (accountKw[i] = v)" @pick="(v) => { line.accountCode = v; accountKw[i] = ''; }" />
				<ion-item v-if="store.currencyOptions.length > 1">
					<ion-select v-model="line.currency" :label="tr('CURRENCY')" label-placement="stacked" interface="action-sheet">
						<ion-select-option v-for="c in store.currencyOptions" :key="c.value" :value="c.value">{{ c.label }}</ion-select-option>
					</ion-select>
				</ion-item>
				<ion-item>
					<ion-input v-model="line.description" :label="tr('LINE_DESC')" label-placement="stacked" :placeholder="tr('LINE_DESC')" />
				</ion-item>
				<ion-item>
					<div class="je_amounts">
						<div>
							<NumberInput :model-value="line.debitAmount" min="0" step="0.01" :label="tr('DEBIT')" label-placement="stacked"
								:placeholder="tr('DEBIT')" @update:model-value="(v) => setAmount(i, 'debit', v)" />
							<div v-if="line.currency !== 'USD' && Number(line.debitAmount) > 0" class="je_base">≈ {{ money(store.toBase(line.debitAmount, line.currency)) }}</div>
						</div>
						<div>
							<NumberInput :model-value="line.creditAmount" min="0" step="0.01" :label="tr('CREDIT')" label-placement="stacked"
								:placeholder="tr('CREDIT')" @update:model-value="(v) => setAmount(i, 'credit', v)" />
							<div v-if="line.currency !== 'USD' && Number(line.creditAmount) > 0" class="je_base">≈ {{ money(store.toBase(line.creditAmount, line.currency)) }}</div>
						</div>
					</div>
				</ion-item>
			</ion-list>
			<div class="act_btns">
				<ion-button fill="outline" @click="store.addLine">+ {{ tr("ADD_ACCOUNT") }}</ion-button>
			</div>
		</ion-content>

		<ion-footer>
			<ion-toolbar>
				<div class="je_totals">
					<div><small>{{ tr("DEBIT") }} (USD)</small><b>{{ money(store.totalDebit) }}</b></div>
					<div><small>{{ tr("CREDIT") }} (USD)</small><b>{{ money(store.totalCredit) }}</b></div>
				</div>
				<div class="je_balance" :class="store.balanced ? 'act_ok' : 'act_bad'">
					{{ store.balanced ? tr("BALANCED") : tr("UNBALANCED") + " · " + money(Math.abs(store.totalDebit - store.totalCredit)) }}
				</div>
				<div class="je_btns">
					<ion-button fill="outline" @click="router.back()">{{ tr("CANCEL") }}</ion-button>
					<ion-button :disabled="!store.valid || store.saving" @click="save">{{ tr("POST") }}</ion-button>
				</div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import NumberInput from "@/core/components/NumberInput.vue";
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import SearchPickField from "@/views/POS/SAL/SearchPickField.vue";
import { ACT20200Store } from "@/store/ACT/ACT20200Store";

/** Manual journal entry: balanced USD lines, secondary-currency lines converted at the entry's rate. */
defineOptions({ name: "ACT20200" });

const { t } = useI18n();
const tr = (k: string) => t(`ACT20200.${k}`);
const router = useRouter();
const store = ACT20200Store();
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");

// Ionic reuses this page: a fresh entry on first show or after a post; otherwise keep the draft.
let fresh = true;
useViewEnter(() => {
	if (!fresh && store.accounts.length && store.savedJournalNo === null) return;
	fresh = false;
	store.reset();
	store.loadAccounts();
	void store.loadCurrency();
});

// Searchable account picker (web: a-select show-search), one keyword per line.
const accountKw = ref<Record<number, string>>({});
const accountLabel = (code?: string) => store.accountOptions.find((a) => a.value === code)?.label ?? "";
function matchAccounts(kw?: string): { value: string; label: string }[] {
	const q = (kw ?? "").trim().toLowerCase();
	return q ? store.accountOptions.filter((a) => a.label.toLowerCase().includes(q)) : [];
}
// Store signals a successful post — the screen owns the navigation back to the list.
watch(() => store.savedJournalNo, (no) => { if (no !== null) router.replace("/ACT20000"); });

/** A line is debit XOR credit — the store's onAmount clears the other side. */
function setAmount(i: number, side: "debit" | "credit", v?: number | null): void {
	const n = v == null ? null : Math.max(0, v); // no negative amounts (web min=0)
	if (side === "debit") store.lines[i].debitAmount = n;
	else store.lines[i].creditAmount = n;
	store.onAmount(i, side);
}
function save(): void {
	store.save({ posted: tr("POSTED"), failed: tr("POST_FAILED") });
}
</script>

<style scoped src="./act-report.css"></style>
<style scoped>
.je_line { margin-top: 8px; }
.je_amounts { display: flex; gap: 8px; width: 100%; }
.je_amounts > div { flex: 1; }
.je_base { font-size: 12px; color: #6b6b76; padding-bottom: 4px; }
.je_totals { display: flex; gap: 16px; padding: 4px 16px 0;
	div { flex: 1; display: flex; flex-direction: column; }
	small { font-size: 12px; color: #6b6b76; }
	b { font-size: 16px; font-variant-numeric: tabular-nums; }
}
.je_balance { padding: 2px 16px; font-size: 12px; font-weight: 600; }
.je_btns { display: flex; gap: 8px; padding: 4px 16px 8px; }
.je_btns ion-button { flex: 1; }
</style>
