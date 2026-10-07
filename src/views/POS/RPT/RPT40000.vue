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
						<p class="r_code">{{ r.productCode }}<template v-if="r.categoryName"> · {{ r.categoryName }}</template></p>
						<h2>{{ r.productName }}</h2>
						<p>{{ tr("COL_QTY") }}: {{ r.totalQuantitySold }} · {{ tr("COL_AVG_COST") }}: {{ money(r.averageCost) }}</p>
						<p>{{ tr("COL_REVENUE") }}: {{ money(r.totalRevenue) }} · {{ tr("COL_TX") }}: {{ r.totalTransactions }}</p>
					</ion-label>
					<div slot="end" class="r_end">
						<small>{{ tr("COL_TOTAL_COST") }}</small>
						<b>{{ money(r.totalCost) }}</b>
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
import { RPT40000Store } from "@/store/POS/RPT/RPT40000Store";
import ReportCards from "@/views/POS/RPT/ReportCards.vue";
import ReportDateRange from "@/views/POS/RPT/ReportDateRange.vue";
import type { ProductProfitRow } from "@/models/POS/RPT/RPT40000";

/** COGS: per-product cost for a date range (cost-sorted); totals over all rows like the web. */
defineOptions({ name: "RPT40000" });

const { t } = useI18n();
const tr = (key: string) => t(`RPT40000.${key}`);
const store = RPT40000Store();
const money = (v: unknown) => "$ " + UT.currency(Number(v ?? 0), "USD");

// The report returns every row at once; page through it locally (the web table paginates client-side too).
const paged = usePagedList<ProductProfitRow>((pageNo, pageSize) =>
	Promise.resolve({ list: store.rows.slice((pageNo - 1) * pageSize, pageNo * pageSize), totalCount: store.rows.length }));
const { rows, hasMore } = paged;
watch(() => store.rows, () => void paged.reload());

const cards = computed(() => [
	{ label: tr("TOTAL_COGS"), value: money(store.totalCost) },
	{ label: tr("UNITS_SOLD"), value: UT.number(Number(store.totalQty ?? 0)) },
	{ label: tr("PRODUCTS"), value: store.rows.length }
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
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
