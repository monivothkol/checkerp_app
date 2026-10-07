<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu" />
		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />

			<div class="act_cards">
				<div class="act_card"><div class="act_card_label">{{ tr("CASH") }}</div><div class="act_card_value">{{ money(store.data.cashBalance) }}</div></div>
				<div class="act_card"><div class="act_card_label">{{ tr("ASSETS") }}</div><div class="act_card_value">{{ money(store.data.totalAssets) }}</div></div>
				<div class="act_card"><div class="act_card_label">{{ tr("LIABILITIES") }}</div><div class="act_card_value">{{ money(store.data.totalLiabilities) }}</div></div>
				<div class="act_card"><div class="act_card_label">{{ tr("EQUITY") }}</div><div class="act_card_value">{{ money(store.data.totalEquity) }}</div></div>
				<div class="act_card"><div class="act_card_label">{{ tr("MONTH_REVENUE") }}</div><div class="act_card_value">{{ money(store.data.monthRevenue) }}</div></div>
				<div class="act_card"><div class="act_card_label">{{ tr("MONTH_EXPENSE") }}</div><div class="act_card_value">{{ money(store.data.monthExpense) }}</div></div>
				<div class="act_card">
					<div class="act_card_label">{{ tr("MONTH_NET") }}</div>
					<div class="act_card_value" :class="Number(store.data.monthNetIncome) >= 0 ? 'act_ok' : 'act_bad'">{{ money(store.data.monthNetIncome) }}</div>
				</div>
			</div>

			<div class="act_section">{{ tr("RECENT") }}</div>
			<ion-list class="scr_list" lines="full">
				<ion-item v-for="r in store.recent" :key="r.journalNo" button @click="openDetail(r.journalNo)">
					<ion-label>
						<p>{{ r.journalNo }} · {{ r.entryDate }}</p>
						<h3>{{ r.description }}</h3>
						<ion-badge color="medium">{{ r.sourceType }}</ion-badge>
					</ion-label>
					<span slot="end" class="act_amt">{{ money(r.amount) }}</span>
				</ion-item>
				<ion-item v-if="!store.recent.length && !store.loading"><ion-label class="act_muted">{{ tr("NO_ACTIVITY") }}</ion-label></ion-item>
			</ion-list>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { RefresherCustomEvent } from "@ionic/vue";
import UT from "@/core/utilities/ut";
import POP from "@/core/utilities/pop";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { ACT10000Store } from "@/store/ACT/ACT10000Store";
import JournalDetailModal from "@/views/ACT/ACT20100.vue";

/** Accounting overview: balance-sheet + month KPIs and the latest journals (tap = journal detail). */
defineOptions({ name: "ACT10000" });

const { t } = useI18n();
const tr = (k: string) => t(`ACT10000.${k}`);
const store = ACT10000Store();
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");

useViewEnter(() => store.load());
async function onRefresh(ev: RefresherCustomEvent): Promise<void> {
	store.load();
	await ev.target.complete();
}
// Phone addition: the recent rows open the same journal detail sheet as ACT20000.
function openDetail(journalNo: string): void {
	POP.showPopup(JournalDetailModal, { title: journalNo, props: { journalNo } }).promise.catch(() => undefined);
}
</script>

<style scoped src="./act-report.css"></style>
