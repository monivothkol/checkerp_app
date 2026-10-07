<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #end>
				<ion-button @click="onExport"><ion-icon slot="icon-only" :icon="downloadOutline" /></ion-button>
			</template>
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
						<p>{{ tr("COL_QTY") }}: {{ r.quantity }} · {{ tr("COL_COST") }}: {{ money(r.costPrice) }} · {{ tr("COL_PRICE") }}: {{ money(r.sellingPrice) }}</p>
						<p>{{ tr("COL_COST_VALUE") }}: {{ money(r.stockValueAtCost) }}</p>
						<p>{{ tr("COL_PROFIT") }}: {{ money(r.potentialProfit) }}</p>
					</ion-label>
					<div slot="end" class="r_end">
						<small>{{ tr("COL_RETAIL_VALUE") }}</small>
						<b>{{ money(r.stockValueAtSelling) }}</b>
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
import { downloadOutline } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import UT from "@/core/utilities/ut";
import ExportModal from "@/core/components/module/ExportModal.vue";
import { EXPORT_CONFIGS } from "@/core/modules/export-config";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { requestAsync, usePagedList } from "@/core/modules/use-paged-list";
import { RPT20000Store } from "@/store/POS/RPT/RPT20000Store";
import ReportCards from "@/views/POS/RPT/ReportCards.vue";
import type { InventoryValuationResponse, StockValueRow } from "@/models/POS/RPT/RPT20000";

/** Inventory valuation: cost vs retail value + per-item rows, inventory filter, export. */
defineOptions({ name: "RPT20000" });

const { t } = useI18n();
const tr = (key: string) => t(`RPT20000.${key}`);
const store = RPT20000Store();
const money = (v: unknown) => "$ " + UT.currency(Number(v ?? 0), "USD");

// Summary totals come with every page; the latest response wins.
const summary = ref<InventoryValuationResponse | null>(null);
const paged = usePagedList<StockValueRow>((pageNo, pageSize) => requestAsync<InventoryValuationResponse>((listener) =>
	store.api.request({ dataBody: { pageNo, pageSize, inventoryId: store.inventoryId || undefined }, listener }))
	.then((p) => { summary.value = p; return { list: p.items ?? [], totalCount: p.totalItems }; }));
const { rows, totalCount, loading, hasMore } = paged;
const reload = () => void paged.reload();

const num = (v: unknown) => UT.number(Number(v ?? 0));
const cards = computed(() => {
	const s = summary.value;
	const cost = Number(s?.totalCostValue ?? 0);
	const retail = Number(s?.totalStockValue ?? 0);
	return [
		{ label: tr("TOTAL_PRODUCTS"), value: s?.totalProducts ?? 0, hint: `${num(s?.totalQuantity)} ${tr("UNITS")}` },
		{ label: tr("COST_VALUE"), value: money(cost) },
		{ label: tr("RETAIL_VALUE"), value: money(retail) },
		{ label: tr("POTENTIAL_PROFIT"), value: money(retail - cost) }
	];
});

function onExport(): void {
	const cfg = EXPORT_CONFIGS.IVAL;
	POP.showPopup(ExportModal, { title: t(`${cfg.trKey}.PAGE_TITLE`), props: { config: cfg, params: { inventoryId: store.inventoryId || undefined } } }).promise.catch(() => undefined);
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
.r_end small { font-size: 10px; color: #6b6b76; }
.r_end { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; font-size: 14px; font-variant-numeric: tabular-nums; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
