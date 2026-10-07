<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #bottom>
				<ReportDateRange v-model="store.dateRange" clearable @change="reload" />
				<ion-toolbar>
					<ion-searchbar v-model="store.keyword" :placeholder="tr('SEARCH')" :debounce="300" @ion-input="reload" />
				</ion-toolbar>
				<ion-toolbar class="r_filters">
					<div class="r_row">
						<ion-select v-model="store.status" :placeholder="tr('ALL_STATUS')" interface="action-sheet" @ion-change="reload">
							<ion-select-option :value="undefined">{{ tr("ALL_STATUS") }}</ion-select-option>
							<ion-select-option v-for="s in STATUSES" :key="s" :value="s">{{ tr("STATUS_" + s) }}</ion-select-option>
						</ion-select>
						<ion-select v-model="store.paymentStatus" :placeholder="tr('ALL_PAYMENT')" interface="action-sheet" @ion-change="reload">
							<ion-select-option :value="undefined">{{ tr("ALL_PAYMENT") }}</ion-select-option>
							<ion-select-option v-for="s in PAYMENT_STATUSES" :key="s" :value="s">{{ tr("PAY_" + s) }}</ion-select-option>
						</ion-select>
					</div>
				</ion-toolbar>
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ReportCards :cards="cards" />
			<ion-list v-if="rows.length" class="scr_list" lines="full">
				<ion-item v-for="r in rows" :key="r.adjustmentId">
					<ion-label>
						<p class="r_code">{{ r.invoiceNumber }} · {{ String(r.purchaseDate ?? "").slice(0, 10) }}</p>
						<h2>{{ r.supplierName ?? "—" }}</h2>
						<p>{{ r.inventoryName }} · {{ tr("COL_ITEMS") }}: {{ r.itemCount ?? 0 }}</p>
						<p>{{ tr("COL_PAID") }}: {{ money(r.paidAmount) }} · {{ tr("COL_OUTSTANDING") }}: {{ money(r.outstandingAmount) }}</p>
					</ion-label>
					<div slot="end" class="r_end">
						<b>{{ money(r.totalAmount) }}</b>
						<ion-badge :color="payColor(r.paymentStatus)">{{ tr("PAY_" + (r.paymentStatus || "UNPAID")) }}</ion-badge>
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
import { RPT90000Store } from "@/store/POS/RPT/RPT90000Store";
import ReportCards from "@/views/POS/RPT/ReportCards.vue";
import ReportDateRange from "@/views/POS/RPT/ReportDateRange.vue";
import type { PurchaseReportResponse, PurchaseReportRow } from "@/models/POS/RPT/RPT90000";

/** Purchase report: purchase/paid/unpaid totals + goods receipts; date, keyword, status and payment filters. */
defineOptions({ name: "RPT90000" });

const STATUSES = ["APPROVED", "PENDING", "CANCELLED"];
const PAYMENT_STATUSES = ["PAID", "PARTIAL", "UNPAID"];
const { t } = useI18n();
const tr = (key: string) => t(`RPT90000.${key}`);
const store = RPT90000Store();
const money = (v: unknown) => "$ " + UT.currency(Number(v ?? 0), "USD");

const summary = ref<PurchaseReportResponse | null>(null);
const paged = usePagedList<PurchaseReportRow>((pageNo, pageSize) => requestAsync<PurchaseReportResponse>((listener) =>
	store.api.request({
		dataBody: {
			pageNo, pageSize,
			dateFrom: store.dateRange?.[0] || undefined, dateTo: store.dateRange?.[1] || undefined,
			status: store.status || undefined, paymentStatus: store.paymentStatus || undefined,
			searchKeyword: store.keyword || undefined
		},
		listener
	}))
	.then((p) => { summary.value = p; return { list: p.items ?? [], totalCount: p.totalElements }; }));
const { rows, loading, hasMore } = paged;
const reload = () => void paged.reload();

const cards = computed(() => {
	const s = summary.value;
	const unpaid = Number(s?.totalUnpaid ?? 0);
	return [
		{ label: tr("TOTAL_PURCHASE"), value: money(s?.totalPurchase), hint: `${s?.purchaseCount ?? 0} ${tr("RECEIPTS")}` },
		{ label: tr("PAID"), value: money(s?.totalPaid) },
		{ label: tr("UNPAID"), value: money(unpaid), tone: unpaid > 0 ? "bad" as const : undefined },
		{ label: tr("ORDERED"), value: money(s?.orderedAmount), hint: tr("ORDERED_HINT") },
		{ label: tr("AVG_ORDER"), value: money(s?.averageOrderValue) }
	];
});

function payColor(status?: string): string {
	if (status === "PAID") return "success";
	return status === "PARTIAL" ? "warning" : "danger";
}
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
.r_row { display: flex; gap: 8px; padding: 0 16px; }
.r_row ion-select { flex: 1; min-width: 0; }
.r_code { font-size: 10px; letter-spacing: .3px; }
.r_end { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; font-size: 14px; font-variant-numeric: tabular-nums; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
