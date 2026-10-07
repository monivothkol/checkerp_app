<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #bottom>
				<ReportDateRange v-model="store.dateRange" clearable @change="reload" />
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ReportCards :cards="cards" />
			<ion-list v-if="rows.length" class="scr_list" lines="full">
				<ion-item v-for="r in rows" :key="r.supplierId">
					<ion-label>
						<p class="r_code">{{ r.supplierCode }}<template v-if="r.supplierPhone"> · {{ r.supplierPhone }}</template></p>
						<h2>{{ r.supplierName }}</h2>
						<p>{{ tr("COL_ORDERS") }}: {{ r.orderCount ?? 0 }} · {{ tr("COL_AVG") }}: {{ money(r.averageOrder) }}</p>
						<p>{{ tr("COL_PAID") }}: {{ money(r.paidAmount) }} · <span :class="Number(r.outstanding ?? 0) > 0 ? 'r_bad' : ''">{{ tr("COL_OUTSTANDING") }}: {{ money(r.outstanding) }}</span></p>
						<p>{{ tr("COL_LAST") }}: {{ String(r.lastPurchaseDate ?? "").slice(0, 10) || "—" }} · {{ tr("COL_DELIVERY") }}: {{ r.avgDeliveryDays != null ? r.avgDeliveryDays : "—" }}</p>
					</ion-label>
					<div slot="end" class="r_end">
						<small>{{ tr("COL_TOTAL") }}</small>
						<b>{{ money(r.totalPurchase) }}</b>
					</div>
				</ion-item>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />
			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)"><ion-infinite-scroll-content /></ion-infinite-scroll>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { InfiniteScrollCustomEvent, RefresherCustomEvent } from "@ionic/vue";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { requestAsync, usePagedList } from "@/core/modules/use-paged-list";
import { RPT91000Store } from "@/store/POS/RPT/RPT91000Store";
import ReportCards from "@/views/POS/RPT/ReportCards.vue";
import ReportDateRange from "@/views/POS/RPT/ReportDateRange.vue";
import type { SupplierAnalysisResponse, SupplierAnalysisRow } from "@/models/POS/RPT/RPT91000";

/** Supplier analysis: spend, outstanding and delivery time per supplier for an optional date range. */
defineOptions({ name: "RPT91000" });

const { t } = useI18n();
const tr = (key: string) => t(`RPT91000.${key}`);
const store = RPT91000Store();
const money = (v: unknown) => "$ " + UT.currency(Number(v ?? 0), "USD");

const summary = ref<SupplierAnalysisResponse | null>(null);
const paged = usePagedList<SupplierAnalysisRow>((pageNo, pageSize) => requestAsync<SupplierAnalysisResponse>((listener) =>
	store.api.request({ dataBody: { pageNo, pageSize, dateFrom: store.dateRange?.[0] || undefined, dateTo: store.dateRange?.[1] || undefined }, listener }))
	.then((p) => { summary.value = p; return { list: p.suppliers ?? [], totalCount: p.totalElements }; }));
const { rows, loading, hasMore } = paged;
const reload = () => void paged.reload();

const cards = computed(() => {
	const s = summary.value;
	const outstanding = Number(s?.totalOutstanding ?? 0);
	return [
		{ label: tr("SUPPLIERS_USED"), value: s?.suppliersUsed ?? 0 },
		{ label: tr("TOP_SPEND"), value: money(s?.topSupplierSpend) },
		{ label: tr("OUTSTANDING"), value: money(outstanding), tone: outstanding > 0 ? "bad" as const : undefined },
		{ label: tr("AVG_DELIVERY"), value: s?.averageDeliveryDays != null ? `${s.averageDeliveryDays} ${tr("DAYS")}` : "—" }
	];
});

async function onRefresh(ev: RefresherCustomEvent): Promise<void> {
	await paged.reload();
	await ev.target.complete();
}
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> {
	await paged.more();
	await ev.target.complete();
}

useViewEnter(reload);
</script>

<style scoped>
.r_code { font-size: 10px; letter-spacing: .3px; }
.r_end { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; font-size: 14px; font-variant-numeric: tabular-nums; }
.r_end small { font-size: 10px; color: #6b6b76; }
.r_bad { color: #B4231F; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
