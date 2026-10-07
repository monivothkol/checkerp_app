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
				<ActDateRange v-model="store.dateRange" @change="store.load" />
			</ion-list>

			<div class="act_cards">
				<div class="act_card"><div class="act_card_label">{{ tr("REVENUE") }}</div><div class="act_card_value">{{ money(store.totalRevenue) }}</div></div>
				<div class="act_card"><div class="act_card_label">{{ tr("EXPENSES") }}</div><div class="act_card_value">{{ money(store.totalExpense) }}</div></div>
				<div class="act_card">
					<div class="act_card_label">{{ tr("NET_INCOME") }}</div>
					<div class="act_card_value" :class="store.netIncome >= 0 ? 'act_ok' : 'act_bad'">{{ money(store.netIncome) }}</div>
				</div>
			</div>

			<ion-accordion-group :multiple="true" :value="OPEN">
				<ActSection value="rev" :title="tr('REVENUE')" :total="money(store.totalRevenue)">
					<ion-item v-for="r in store.revenueList" :key="r.accountCode">
						<ion-label><p>{{ r.accountCode }}</p><h3>{{ r.accountName }}</h3></ion-label>
						<span slot="end" class="act_amt">{{ money(r.amount) }}</span>
					</ion-item>
					<ion-item v-if="!store.revenueList.length"><ion-label class="act_muted">{{ tr("NONE") }}</ion-label></ion-item>
					<ion-item class="act_total">
						<ion-label><h2>{{ tr("TOTAL_REVENUE") }}</h2></ion-label>
						<span slot="end" class="act_amt act_bold">{{ money(store.totalRevenue) }}</span>
					</ion-item>
				</ActSection>
				<ActSection value="exp" :title="tr('EXPENSES')" :total="money(store.totalExpense)">
					<ion-item v-for="r in store.expenseList" :key="r.accountCode">
						<ion-label><p>{{ r.accountCode }}</p><h3>{{ r.accountName }}</h3></ion-label>
						<span slot="end" class="act_amt">{{ money(r.amount) }}</span>
					</ion-item>
					<ion-item v-if="!store.expenseList.length"><ion-label class="act_muted">{{ tr("NONE") }}</ion-label></ion-item>
					<ion-item class="act_total">
						<ion-label><h2>{{ tr("TOTAL_EXPENSES") }}</h2></ion-label>
						<span slot="end" class="act_amt act_bold">{{ money(store.totalExpense) }}</span>
					</ion-item>
				</ActSection>
			</ion-accordion-group>
			<ion-list class="scr_list" lines="full">
				<ion-item class="act_total">
					<ion-label><h2>{{ tr("NET_INCOME") }}</h2></ion-label>
					<span slot="end" class="act_amt act_bold" :class="store.netIncome >= 0 ? 'act_ok' : 'act_bad'">{{ money(store.netIncome) }}</span>
				</ion-item>
			</ion-list>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { RefresherCustomEvent } from "@ionic/vue";
import { downloadOutline } from "ionicons/icons";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { ACT30000Store } from "@/store/ACT/ACT30000Store";
import ActDateRange from "@/views/ACT/ActDateRange.vue";
import ActSection from "@/views/ACT/ActSection.vue";
import { pickStatementExport } from "@/views/ACT/act-export";

/** Income statement (P&L) for a period: revenue and expense sections, net income; PDF/Excel export. */
defineOptions({ name: "ACT30000" });

const { t } = useI18n();
const tr = (k: string) => t(`ACT30000.${k}`);
const store = ACT30000Store();
const OPEN = ["rev", "exp"];
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");

useViewEnter(() => store.load());
async function onRefresh(ev: RefresherCustomEvent): Promise<void> {
	store.load();
	await ev.target.complete();
}
const onExport = () => void pickStatementExport(tr, (format, done) => store.exportStatement(format, done));
</script>

<style scoped src="./act-report.css"></style>
