<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #end>
				<ion-button @click="onExport"><ion-icon slot="icon-only" :icon="downloadOutline" /></ion-button>
			</template>
			<template #bottom>
				<ion-toolbar>
					<ion-searchbar v-model="store.keyword" :placeholder="tr('SEARCH_PLACEHOLDER')" :debounce="300" @ion-input="reload" />
				</ion-toolbar>
				<ion-toolbar>
					<div class="pur_filters">
						<ion-select :value="store.status ?? ''" :placeholder="tr('ALL_STATUS')" interface="action-sheet" @ion-change="onStatus($event.detail.value)">
							<ion-select-option value="">{{ tr("ALL_STATUS") }}</ion-select-option>
							<ion-select-option v-for="s in store.statuses" :key="s" :value="s">{{ tr("STATUS_" + s) }}</ion-select-option>
						</ion-select>
						<ion-select :value="store.supplierId ?? ''" :placeholder="tr('ALL_SUPPLIERS')" interface="action-sheet" @ion-change="onSupplier($event.detail.value)">
							<ion-select-option value="">{{ tr("ALL_SUPPLIERS") }}</ion-select-option>
							<ion-select-option v-for="s in store.suppliers" :key="s.supplierId" :value="s.supplierId">{{ supplierLabel(s) }}</ion-select-option>
						</ion-select>
					</div>
				</ion-toolbar>
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-note v-if="totalCount" class="pur_total">
				{{ $t("LIST.TOTAL_ITEMS", { total: totalCount }) }}<template v-if="totals"> · {{ tr("COL_TOTAL") }} {{ money(totals.grandTotal) }}</template>
			</ion-note>
			<ion-list v-if="rows.length" class="scr_list">
				<ion-item v-for="r in rows" :key="r.poId" button :detail="true" @click="openDetail(r.poId)">
					<ion-label>
						<p class="pur_code">{{ r.poCode }} · {{ r.orderDate ?? "—" }}</p>
						<h2>{{ r.supplierName || "—" }}</h2>
						<p>{{ tr("COL_INVENTORY") }}: {{ r.inventoryName || "—" }}</p>
						<p>{{ tr("COL_EXPECTED") }}: {{ r.expectedDeliveryDate || "—" }} · {{ tr("COL_ITEMS") }}: {{ r.itemCount ?? 0 }}</p>
						<h3>{{ money(r.grandTotal) }}</h3>
					</ion-label>
					<ion-badge slot="end" :color="statusColor(r.status)">{{ tr("STATUS_" + r.status) }}</ion-badge>
				</ion-item>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />
			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)"><ion-infinite-scroll-content /></ion-infinite-scroll>

			<ion-fab slot="fixed" vertical="bottom" horizontal="end">
				<ion-fab-button @click="router.push('/PUR11000')"><ion-icon :icon="add" /></ion-fab-button>
			</ion-fab>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import type { InfiniteScrollCustomEvent, RefresherCustomEvent } from "@ionic/vue";
import { add, downloadOutline } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import UT from "@/core/utilities/ut";
import ExportModal from "@/core/components/module/ExportModal.vue";
import { EXPORT_CONFIGS } from "@/core/modules/export-config";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { requestAsync, usePagedList } from "@/core/modules/use-paged-list";
import { PUR10000Store } from "@/store/POS/PUR/PUR10000Store";
import type { PUR10000ListTotals, PUR10000Response, PurchaseOrderRow } from "@/models/POS/PUR/PUR10000";
import type { SupplierLookup } from "@/models/POS/COMMON/lookups";

/** Purchase-order list: search, status/supplier filters, filter-wide grand total. */
defineOptions({ name: "PUR10000" });

const { t } = useI18n();
const tr = (k: string) => t(`PUR10000.${k}`);
const router = useRouter();
const store = PUR10000Store();
const totals = ref<PUR10000ListTotals | null>(null);
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");

const paged = usePagedList<PurchaseOrderRow>((pageNo, pageSize) => requestAsync<PUR10000Response>((listener) => store.poApi.request({
	dataBody: { pageNo, pageSize, status: store.status, supplierId: store.supplierId, searchKeyword: store.keyword },
	listener
})).then((p) => { totals.value = p.totals ?? null; return { list: p.poList ?? [], totalCount: p.totalCount }; }));
const { rows, totalCount, loading, hasMore } = paged;
const reload = () => void paged.reload();

function onStatus(v: string): void { store.status = v || undefined; reload(); }
function onSupplier(v: string): void { store.supplierId = v || undefined; reload(); }
const supplierLabel = (s: SupplierLookup) => s.supplierName || s.contactName || s.supplierCode || "—";
function statusColor(s: string): string {
	if (s === "COMPLETED") return "success";
	if (s === "SENT" || s === "CONFIRMED") return "primary";
	if (s === "PARTIAL") return "warning";
	if (s === "CANCELLED") return "danger";
	return "medium";
}
function openDetail(poId: string): void { router.push(`/PUR14000?poId=${encodeURIComponent(poId)}`); }
function onExport(): void {
	const cfg = EXPORT_CONFIGS.PO;
	POP.showPopup(ExportModal, { title: t(`${cfg.trKey}.PAGE_TITLE`), props: { config: cfg } }).promise.catch(() => undefined);
}
async function onRefresh(ev: RefresherCustomEvent): Promise<void> { await paged.reload(); await ev.target.complete(); }
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> { await paged.more(); await ev.target.complete(); }

onMounted(() => store.loadSuppliers());
useViewEnter(reload);
</script>

<style scoped>
.pur_filters { display: flex; gap: 8px; padding: 0 12px; }
.pur_filters ion-select { flex: 1; font-size: 14px; }
.pur_total { display: block; padding: 8px 16px 0; font-size: 12px; }
.pur_code { font-size: 12px; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label h3 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
