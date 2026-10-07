<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #bottom>
				<ion-toolbar>
					<ion-select v-model="store.inventoryId" class="r_sel" :placeholder="tr('ALL_INVENTORIES')" interface="action-sheet" @ion-change="reload">
						<ion-select-option :value="undefined">{{ tr("ALL_INVENTORIES") }}</ion-select-option>
						<ion-select-option v-for="inv in store.inventories" :key="inv.inventoryId" :value="inv.inventoryId">{{ inv.inventoryName || inv.name }}</ion-select-option>
					</ion-select>
				</ion-toolbar>
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ReportCards :cards="cards" />
			<ion-list v-if="rows.length" class="scr_list" lines="full">
				<ion-item v-for="(r, i) in rows" :key="`${r.productId}-${r.inventoryId}-${i}`">
					<ion-label>
						<p class="r_code">{{ r.productCode }} · {{ r.inventoryName }}</p>
						<h2>{{ r.productName }}</h2>
						<p>{{ tr("COL_QTY") }}: {{ r.quantity }} · {{ tr("COL_AVG_COST") }}: {{ money(r.averageCost) }}</p>
						<p>{{ tr("COL_RECEIVED") }}: {{ String(r.firstReceivedDate ?? "").slice(0, 10) }} · {{ tr("COL_DAYS") }}: {{ r.daysInStock }}</p>
					</ion-label>
					<div slot="end" class="r_end">
						<b>{{ money(r.totalValue) }}</b>
						<ion-badge :color="bucketColor(r.ageBucket)">{{ r.ageBucket }}</ion-badge>
					</div>
				</ion-item>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />
			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)"><ion-infinite-scroll-content /></ion-infinite-scroll>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { InfiniteScrollCustomEvent, RefresherCustomEvent } from "@ionic/vue";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { requestAsync, usePagedList } from "@/core/modules/use-paged-list";
import { RPT10000Store } from "@/store/POS/RPT/RPT10000Store";
import ReportCards from "@/views/POS/RPT/ReportCards.vue";
import type { StockAgingReportResponse, StockAgingRow } from "@/models/POS/RPT/RPT10000";

/** Stock aging: value per age bucket + per-item rows, inventory filter. */
defineOptions({ name: "RPT10000" });

const { t } = useI18n();
const tr = (key: string) => t(`RPT10000.${key}`);
const store = RPT10000Store();
const money = (v: unknown) => "$ " + UT.currency(Number(v ?? 0), "USD");

// Summary totals come with every page; the latest response wins.
const summary = ref<StockAgingReportResponse | null>(null);
const paged = usePagedList<StockAgingRow>((pageNo, pageSize) => requestAsync<StockAgingReportResponse>((listener) =>
	store.api.request({ dataBody: { pageNo, pageSize, inventoryId: store.inventoryId || undefined }, listener }))
	.then((p) => { summary.value = p; return { list: p.items ?? [], totalCount: p.totalItems }; }));
const { rows, totalCount, loading, hasMore } = paged;
const reload = () => void paged.reload();

const cards = computed(() => {
	const s = summary.value;
	return [
		{ label: tr("TOTAL_VALUE"), value: money(s?.totalValue), hint: `${totalCount.value} ${tr("ITEMS")}` },
		{ label: tr("BUCKET_0_30"), value: money(s?.value0To30Days) },
		{ label: tr("BUCKET_31_60"), value: money(s?.value31To60Days) },
		{ label: tr("BUCKET_61_90"), value: money(s?.value61To90Days) },
		{ label: tr("BUCKET_90_PLUS"), value: money(s?.value90PlusDays), tone: "bad" as const }
	];
});

function bucketColor(bucket?: string): string {
	if (bucket === "90+") return "danger";
	return bucket === "61-90" ? "medium" : "success";
}
async function onRefresh(ev: RefresherCustomEvent): Promise<void> {
	await paged.reload();
	await ev.target.complete();
}
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> {
	await paged.more();
	await ev.target.complete();
}

onMounted(() => store.loadInventories());
useViewEnter(reload);
</script>

<style scoped>
.r_sel { padding: 0 16px; }
.r_code { font-size: 10px; letter-spacing: .3px; }
.r_end { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; font-size: 14px; font-variant-numeric: tabular-nums; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
