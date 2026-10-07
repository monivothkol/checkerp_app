<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu" />
		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<ion-list class="scr_list" lines="full">
				<ion-item>
					<ion-select v-model="store.accountCode" :label="tr('PICK_ACCOUNT')" label-placement="stacked" :placeholder="tr('PICK_ACCOUNT')"
						interface="action-sheet" @ion-change="store.onFilter">
						<ion-select-option v-for="a in store.accounts" :key="a.accountCode" :value="a.accountCode">{{ a.accountCode }} — {{ a.accountName }}</ion-select-option>
					</ion-select>
				</ion-item>
				<ActDateRange v-model="store.dateRange" @change="store.onFilter" />
			</ion-list>

			<template v-if="store.accountCode">
				<div class="act_cards">
					<div class="act_card"><div class="act_card_label">{{ tr("BOOK_BALANCE") }}</div><div class="act_card_value">{{ money(store.bookBalance) }}</div></div>
					<div class="act_card"><div class="act_card_label">{{ tr("CLEARED_BALANCE") }}</div><div class="act_card_value act_ok">{{ money(store.clearedBalance) }}</div></div>
					<div class="act_card">
						<div class="act_card_label">{{ tr("UNCLEARED") }}</div>
						<div class="act_card_value" :class="store.unclearedBalance === 0 ? 'act_ok' : 'act_bad'">{{ money(store.unclearedBalance) }}</div>
					</div>
				</div>
				<ion-list class="scr_list" lines="full">
					<template v-for="r in store.rows" :key="r.lineId">
						<ion-item :class="{ rc_done: r.reconciled }" lines="none">
							<ion-checkbox slot="start" :checked="r.reconciled" :aria-label="tr('CLEARED')" @ion-change="onToggle(r, $event)" />
							<ion-label>
								<p>{{ r.entryDate }} · {{ r.journalNo }}</p>
								<h3 class="ion-text-wrap">{{ r.description }}</h3>
							</ion-label>
							<div slot="end" class="rc_amt">
								<small v-if="Number(r.debitAmount) > 0">{{ tr("DEBIT") }} {{ money(r.debitAmount) }}</small>
								<small v-if="Number(r.creditAmount) > 0">{{ tr("CREDIT") }} {{ money(r.creditAmount) }}</small>
							</div>
						</ion-item>
						<ion-item :class="{ rc_done: r.reconciled }">
							<ion-input v-model="r.statementReference" :label="tr('STATEMENT_REF')" label-placement="stacked" :placeholder="tr('REF_PH')" />
						</ion-item>
					</template>
					<ion-item v-if="!store.loading && !store.rows.length"><ion-label class="act_muted">{{ tr("NO_LINES") }}</ion-label></ion-item>
				</ion-list>
			</template>
			<bm-empty-state v-else description="ACT23000.PICK_ACCOUNT_HINT" />
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { RefresherCustomEvent } from "@ionic/vue";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { ACT23000Store } from "@/store/ACT/ACT23000Store";
import type { ReconcileLine } from "@/models/ACT/ACT23000";
import ActDateRange from "@/views/ACT/ActDateRange.vue";

/** Bank reconciliation: pick a reconcilable account, tick lines cleared against the statement (ref saved with the tick). */
defineOptions({ name: "ACT23000" });

const { t } = useI18n();
const tr = (k: string) => t(`ACT23000.${k}`);
const store = ACT23000Store();
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");

useViewEnter(() => store.load());
async function onRefresh(ev: RefresherCustomEvent): Promise<void> {
	store.load();
	await ev.target.complete();
}
/** Ionic checkboxes are uncontrolled: snap back to the saved state; the reload after a successful mark flips it. */
function onToggle(line: ReconcileLine, ev: CustomEvent): void {
	(ev.target as HTMLIonCheckboxElement).checked = !!line.reconciled;
	store.toggle(line, tr("MARK_FAILED"));
}
</script>

<style scoped src="./act-report.css"></style>
<style scoped>
.rc_done { --background: var(--ion-color-primary-tint, #eef3ff); }
.rc_amt { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; font-variant-numeric: tabular-nums;
	small { font-size: 12px; }
}
</style>
