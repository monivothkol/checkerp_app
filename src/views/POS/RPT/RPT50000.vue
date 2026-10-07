<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #bottom>
				<ReportDateRange v-model="store.dateRange" @change="store.reload()" />
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<ReportCards :cards="cards" />
			<ion-list v-if="rows.length" class="scr_list" lines="full">
				<ion-item v-for="r in rows" :key="r.productId">
					<ion-label>
						<p class="r_code">{{ r.productCode }}</p>
						<h2>{{ r.productName }}</h2>
						<p>{{ tr("COL_QTY") }}: {{ r.totalQuantitySold }} · {{ tr("COL_MARGIN") }}: {{ Number(r.profitMarginPercentage ?? 0).toFixed(2) }}%</p>
						<p>{{ tr("COL_REVENUE") }}: {{ money(r.totalRevenue) }} · {{ tr("COL_COST") }}: {{ money(r.totalCost) }}</p>
					</ion-label>
					<div slot="end" class="r_end">
						<small>{{ tr("COL_PROFIT") }}</small>
						<b :class="Number(r.totalGrossProfit ?? 0) >= 0 ? '' : 'r_bad'">{{ money(r.totalGrossProfit) }}</b>
					</div>
				</ion-item>
			</ion-list>
			<bm-empty-state v-else-if="!store.loading" />
			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)"><ion-infinite-scroll-content /></ion-infinite-scroll>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { InfiniteScrollCustomEvent, RefresherCustomEvent } from "@ionic/vue";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { usePagedList } from "@/core/modules/use-paged-list";
import { RPT50000Store } from "@/store/POS/RPT/RPT50000Store";
import ReportCards from "@/views/POS/RPT/ReportCards.vue";
import ReportDateRange from "@/views/POS/RPT/ReportDateRange.vue";
import type { ProductProfitRow } from "@/models/POS/RPT/RPT40000";

/** Gross profit (P&L) per product for a date range; totals and margin over all rows like the web. */
defineOptions({ name: "RPT50000" });

const { t } = useI18n();
const tr = (key: string) => t(`RPT50000.${key}`);
const store = RPT50000Store();
const money = (v: unknown) => "$ " + UT.currency(Number(v ?? 0), "USD");

// The report returns every row at once; page through it locally (the web table paginates client-side too).
const paged = usePagedList<ProductProfitRow>((pageNo, pageSize) =>
	Promise.resolve({ list: store.rows.slice((pageNo - 1) * pageSize, pageNo * pageSize), totalCount: store.rows.length }));
const { rows, hasMore } = paged;
watch(() => store.rows, () => void paged.reload());

const cards = computed(() => [
	{ label: tr("REVENUE"), value: money(store.totalRevenue) },
	{ label: tr("COST"), value: money(store.totalCost) },
	{ label: tr("GROSS_PROFIT"), value: money(store.totalProfit), tone: store.totalProfit >= 0 ? "ok" as const : "bad" as const },
	{ label: tr("MARGIN"), value: `${store.marginPct.toFixed(2)}%` }
]);

async function onRefresh(ev: RefresherCustomEvent): Promise<void> {
	store.reload();
	await ev.target.complete();
}
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> {
	await paged.more();
	await ev.target.complete();
}

useViewEnter(() => store.reload());
</script>

<style scoped>
.r_code { font-size: 10px; letter-spacing: .3px; }
.r_end { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; font-size: 14px; font-variant-numeric: tabular-nums; }
.r_end small { font-size: 10px; color: #6b6b76; }
.r_bad { color: #B4231F; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
