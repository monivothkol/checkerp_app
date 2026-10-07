<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu" />
		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<ion-list class="scr_list" lines="full">
				<ion-item>
					<ion-select v-model="store.accountCodes" :multiple="true" interface="alert" :label="tr('ALL_ACCOUNTS')" label-placement="stacked"
						:placeholder="tr('ALL_ACCOUNTS')" @ion-change="store.load">
						<ion-select-option v-for="a in store.accountOptions" :key="a.value" :value="a.value">{{ a.label }}</ion-select-option>
					</ion-select>
				</ion-item>
				<ActDateRange v-model="dateRange" :required="true" @change="store.load" />
			</ion-list>

			<bm-empty-state v-if="!store.sections.length" description="ACT33000.NO_ACTIVITY" />
			<template v-else>
				<div class="gl_toolbar">
					<ion-button size="small" fill="outline" @click="store.toggleAll">{{ store.allExpanded ? tr("COLLAPSE_ALL") : tr("EXPAND_ALL") }}</ion-button>
				</div>
				<ion-accordion-group :multiple="true" :value="openKeys" @ion-change="onAccordion">
					<ion-accordion v-for="s in store.sections" :key="s.accountCode" :value="s.accountCode">
						<ion-item slot="header" class="gl_head">
							<ion-label>
								<p>{{ s.accountCode }}</p>
								<h2 class="ion-text-wrap">{{ s.accountName }}</h2>
								<p>{{ tr("DEBIT") }} {{ money(s.totalDebit) }} · {{ tr("CREDIT") }} {{ money(s.totalCredit) }}</p>
							</ion-label>
							<span slot="end" class="act_amt act_bold">{{ money(s.closingBalance) }}</span>
						</ion-item>
						<ion-list slot="content" class="scr_list" lines="full">
							<ion-item>
								<ion-label class="act_muted">{{ tr("OPENING") }}</ion-label>
								<span slot="end" class="act_amt">{{ money(s.openingBalance) }}</span>
							</ion-item>
							<ion-item v-for="(r, i) in s.ledgerList" :key="s.accountCode + '-' + i">
								<ion-label>
									<p>{{ r.entryDate }} · {{ r.journalNo }} · {{ r.sourceCode || r.sourceType }}</p>
									<h3 v-if="r.description" class="ion-text-wrap">{{ r.description }}</h3>
									<p>
										<span v-if="r.debitAmount > 0">{{ tr("DEBIT") }} {{ money(r.debitAmount) }}</span>
										<span v-if="r.creditAmount > 0">{{ tr("CREDIT") }} {{ money(r.creditAmount) }}</span>
									</p>
								</ion-label>
								<div slot="end" class="gl_end"><small>{{ tr("BALANCE") }}</small><span class="act_amt">{{ money(r.balance) }}</span></div>
							</ion-item>
							<ion-item class="act_total">
								<ion-label>
									<h3 class="act_bold ion-text-wrap">{{ tr("TOTAL_FOR") }} {{ s.accountCode }} · {{ s.accountName }}</h3>
									<p>{{ tr("DEBIT") }} {{ money(s.totalDebit) }} · {{ tr("CREDIT") }} {{ money(s.totalCredit) }}</p>
								</ion-label>
								<span slot="end" class="act_amt act_bold">{{ money(s.closingBalance) }}</span>
							</ion-item>
						</ion-list>
					</ion-accordion>
				</ion-accordion-group>
				<ion-list class="scr_list" lines="full">
					<ion-item class="act_total">
						<ion-label>
							<h2>{{ tr("TOTAL") }}</h2>
							<p>{{ tr("DEBIT") }} <b>{{ money(store.totalDebit) }}</b></p>
							<p>{{ tr("CREDIT") }} <b>{{ money(store.totalCredit) }}</b></p>
						</ion-label>
					</ion-item>
				</ion-list>
			</template>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { RefresherCustomEvent } from "@ionic/vue";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { ACT33000Store } from "@/store/ACT/ACT33000Store";
import ActDateRange from "@/views/ACT/ActDateRange.vue";

/** General ledger: per-account sections (opening, lines, running balance, closing) for a required period. */
defineOptions({ name: "ACT33000" });

const { t } = useI18n();
const tr = (k: string) => t(`ACT33000.${k}`);
const store = ACT33000Store();
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");

// The report is range-bound: the picker never clears it (web allow-clear=false).
const dateRange = computed({
	get: () => store.dateRange ?? undefined,
	set: (v) => { if (v) store.dateRange = v; }
});
const openKeys = computed(() => store.sections.filter((s) => store.expanded[s.accountCode]).map((s) => s.accountCode));

/** Accordion taps write back into the store's expanded map (the Expand/Collapse-all button reads it). */
function onAccordion(ev: CustomEvent<{ value?: string | string[] }>): void {
	if (ev.target !== ev.currentTarget) return;
	const open = new Set([ev.detail.value ?? []].flat());
	store.expanded = Object.fromEntries(store.sections.map((s) => [s.accountCode, open.has(s.accountCode)]));
}

useViewEnter(() => {
	store.loadAccounts();
	store.load();
});
async function onRefresh(ev: RefresherCustomEvent): Promise<void> {
	store.load();
	await ev.target.complete();
}
</script>

<style scoped src="./act-report.css"></style>
<style scoped>
.gl_head { --padding-start: 16px; }
.gl_toolbar { display: flex; justify-content: flex-end; padding: 8px 16px 0; }
.gl_end { display: flex; flex-direction: column; align-items: flex-end;
	small { font-size: 10px; color: #6b6b76; }
}
ion-label p span + span { margin-left: 8px; }
</style>
