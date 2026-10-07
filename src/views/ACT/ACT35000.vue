<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #end>
				<ion-button :disabled="store.exporting" :aria-label="$t('EXPORT.EXPORT')" @click="onExport"><ion-icon slot="icon-only" :icon="downloadOutline" /></ion-button>
			</template>
		</bm-header>
		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<ion-list class="scr_list" lines="full">
				<ion-item>
					<ion-input v-model="store.asOfDate" type="date" :label="tr('AS_OF')" label-placement="stacked" @ion-change="store.load" />
				</ion-item>
			</ion-list>

			<template v-if="report">
				<div class="act_cards">
					<div class="act_card"><div class="act_card_label">{{ tr("TOTAL_ASSETS") }}</div><div class="act_card_value">{{ money(report.assets?.totalAssets) }}</div></div>
					<div class="act_card"><div class="act_card_label">{{ tr("TOTAL_LIABILITIES") }}</div><div class="act_card_value">{{ money(report.liabilities?.totalLiabilities) }}</div></div>
					<div class="act_card">
						<div class="act_card_label">{{ tr("TOTAL_EQUITY") }}</div>
						<div class="act_card_value" :class="Number(report.equity?.totalEquity ?? 0) >= 0 ? 'act_ok' : 'act_bad'">{{ money(report.equity?.totalEquity) }}</div>
					</div>
				</div>

				<ion-accordion-group :multiple="true" :value="OPEN">
					<ActSection v-for="sec in sections" :key="sec.key" :value="sec.key" :title="tr(sec.title)" :total="money(sec.total)">
						<ion-item v-for="r in sec.rows" :key="r.key">
							<ion-label>{{ tr(r.key) }}</ion-label>
							<span slot="end" class="act_amt">{{ money(r.value) }}</span>
						</ion-item>
						<ion-item class="act_total">
							<ion-label><h2>{{ tr(sec.totalKey) }}</h2></ion-label>
							<span slot="end" class="act_amt act_bold">{{ money(sec.total) }}</span>
						</ion-item>
					</ActSection>
				</ion-accordion-group>
				<ion-list class="scr_list" lines="full">
					<ion-item class="act_total">
						<ion-label><h2>{{ tr("LIAB_PLUS_EQUITY") }}</h2></ion-label>
						<span slot="end" class="act_amt act_bold">{{ money(report.totalLiabilitiesAndEquity) }}</span>
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
import { downloadOutline } from "ionicons/icons";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { ACT35000Store } from "@/store/ACT/ACT35000Store";
import ActSection from "@/views/ACT/ActSection.vue";
import { pickStatementExport } from "@/views/ACT/act-export";

/** Balance statement as of a date (cash/AR/stock/fixed vs payables/debt vs equity); PDF/Excel export. */
defineOptions({ name: "ACT35000" });

const { t } = useI18n();
const tr = (k: string) => t(`ACT35000.${k}`);
const store = ACT35000Store();
const money = (v: unknown) => "$ " + UT.currency(Number(v ?? 0), "USD");
const OPEN = ["a", "l", "e"];
const report = computed(() => store.report);

const sections = computed(() => {
	const r = store.report;
	return [
		{ key: "a", title: "ASSETS", totalKey: "TOTAL_ASSETS", total: r?.assets?.totalAssets, rows: [
			{ key: "CASH", value: r?.assets?.cash },
			{ key: "ACCOUNTS_RECEIVABLE", value: r?.assets?.accountsReceivable },
			{ key: "INVENTORY_VALUE", value: r?.assets?.inventoryValue },
			{ key: "OTHER_CURRENT_ASSETS", value: r?.assets?.otherCurrentAssets },
			{ key: "FIXED_ASSETS", value: r?.assets?.fixedAssets }
		] },
		{ key: "l", title: "LIABILITIES", totalKey: "TOTAL_LIABILITIES", total: r?.liabilities?.totalLiabilities, rows: [
			{ key: "ACCOUNTS_PAYABLE", value: r?.liabilities?.accountsPayable },
			{ key: "SHORT_TERM_DEBT", value: r?.liabilities?.shortTermDebt },
			{ key: "LONG_TERM_DEBT", value: r?.liabilities?.longTermDebt }
		] },
		{ key: "e", title: "EQUITY", totalKey: "TOTAL_EQUITY", total: r?.equity?.totalEquity, rows: [
			{ key: "RETAINED_EARNINGS", value: r?.equity?.retainedEarnings },
			{ key: "OWNER_EQUITY", value: r?.equity?.ownerEquity }
		] }
	];
});

useViewEnter(() => store.load());
async function onRefresh(ev: RefresherCustomEvent): Promise<void> {
	store.load();
	await ev.target.complete();
}
const onExport = () => void pickStatementExport(tr, (format, done) => store.exportStatement(format, done));
</script>

<style scoped src="./act-report.css"></style>
