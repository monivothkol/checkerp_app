<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #end>
				<ion-button @click="onExport"><ion-icon slot="icon-only" :icon="downloadOutline" /></ion-button>
				<ion-button @click="onOpenFilter"><ion-icon slot="icon-only" :icon="funnelOutline" /></ion-button>
			</template>
			<template #bottom>
				<ion-toolbar>
					<ion-searchbar v-model="store.keyword" :placeholder="tr('SEARCH_PLACEHOLDER')" :debounce="400" @ion-input="onSearch" />
				</ion-toolbar>
				<div v-if="chips.length" class="sl_chips">
					<ion-chip v-for="c in chips" :key="c.key" @click="removeFilter(c.key)">
						<ion-label>{{ c.label }}: {{ c.value }}</ion-label>
						<ion-icon :icon="closeCircle" />
					</ion-chip>
				</div>
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<div v-if="totalCount" class="sl_total">
				<span>{{ $t("LIST.TOTAL_ITEMS", { total: totalCount }) }}</span>
				<span v-if="store.totals">{{ $t("LIST.GRAND_TOTAL") }}: $ {{ UT.currency(store.totals.totalAmount ?? 0, "USD") }}</span>
			</div>

			<ion-list v-if="rows.length" class="scr_list">
				<ion-item-sliding v-for="r in rows" :key="r.quotationNo">
					<ion-item button :detail="true" @click="openDetail(r.quotationNo)">
						<ion-label>
							<p class="sl_code">{{ r.quotationNo }} · {{ String(r.quotationDate ?? "").slice(0, 10) }}</p>
							<h2>{{ r.customerName || "—" }}</h2>
							<p>{{ tr("COL_TOTAL") }}: $ {{ UT.currency(r.totalAmount ?? 0, "USD") }}</p>
						</ion-label>
						<ion-badge slot="end" :color="statusColor(r.status)">{{ statusLabel(r.status) }}</ion-badge>
					</ion-item>
					<ion-item-options v-if="statusKey(r.status) === 'ACTIVE'" side="end">
						<ion-item-option @click="openEdit(r.quotationNo)">{{ tr("EDIT") }}</ion-item-option>
					</ion-item-options>
				</ion-item-sliding>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />

			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)"><ion-infinite-scroll-content /></ion-infinite-scroll>

			<ion-fab slot="fixed" vertical="bottom" horizontal="end">
				<ion-fab-button @click="router.push('/SAL12000')"><ion-icon :icon="add" /></ion-fab-button>
			</ion-fab>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import type { InfiniteScrollCustomEvent, RefresherCustomEvent } from "@ionic/vue";
import { add, closeCircle, downloadOutline, funnelOutline } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import UT from "@/core/utilities/ut";
import ExportModal from "@/core/components/module/ExportModal.vue";
import ModuleFilterPanel from "@/core/components/module/ModuleFilterPanel.vue";
import { EXPORT_CONFIGS } from "@/core/modules/export-config";
import type { ModuleListFilter } from "@/core/modules/module-screen-config";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { requestAsync, usePagedList } from "@/core/modules/use-paged-list";
import RetrieveQuotationList from "@/services/api/SAL/retrieveQuotationList";
import type { QuotationRow, SAL11000Response } from "@/models/POS/SAL/SAL11000";
import { SAL11000Store } from "@/store/POS/SAL/SAL11000Store";

/** Quotation list: search, status/date filters, paged scroll; ACTIVE rows can be edited. */
defineOptions({ name: "SAL11000" });

const { t } = useI18n();
const tr = (k: string) => t(`SAL11000.${k}`);
const router = useRouter();
const store = SAL11000Store();

// Store keeps the filter state; paging is the app's infinite scroll.
const paged = usePagedList<QuotationRow>((pageNo, pageSize) => requestAsync<SAL11000Response>((listener) =>
	RetrieveQuotationList.getInstance().request({
		dataBody: {
			pageNo, pageSize,
			searchKeyword: store.keyword || undefined,
			quotationStatusCode: store.statusCode || undefined,
			fromDate: store.dateRange?.[0] || undefined,
			toDate: store.dateRange?.[1] || undefined
		},
		listener
	})).then((p) => { store.totals = p.totals ?? null; return { list: p.quotationList ?? [], totalCount: p.totalCount }; }));
const { rows, totalCount, loading, hasMore } = paged;
const onSearch = () => void paged.reload();
useViewEnter(onSearch);

async function onRefresh(ev: RefresherCustomEvent): Promise<void> { await paged.reload(); await ev.target.complete(); }
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> { await paged.more(); await ev.target.complete(); }

const filterDefs = computed<ModuleListFilter[]>(() => [
	{ key: "statusCode", labelKey: "COL_STATUS", options: store.statuses.map((s) => ({ value: s, label: tr("STATUS_" + s) })) },
	{ key: "dateRange", labelKey: "COL_DATE", type: "dateRange" }
]);
const chips = computed(() => {
	const out: { key: string; label: string; value: string }[] = [];
	if (store.statusCode) out.push({ key: "statusCode", label: tr("COL_STATUS"), value: tr("STATUS_" + store.statusCode) });
	if (store.dateRange) out.push({ key: "dateRange", label: tr("COL_DATE"), value: `${store.dateRange[0]} – ${store.dateRange[1]}` });
	return out;
});
function onOpenFilter(): void {
	const optionsByKey: Record<string, { value: unknown; label: string }[]> = {};
	for (const f of filterDefs.value) optionsByKey[f.key] = f.options ?? [];
	POP.showPopup<Record<string, unknown>>(ModuleFilterPanel, {
		title: t("LIST.FILTER"),
		props: { filters: filterDefs.value, values: { statusCode: store.statusCode, dateRange: store.dateRange ?? undefined }, optionsByKey, listTr: "SAL11000" }
	}).promise.then((r) => {
		store.statusCode = r.data?.statusCode as string | undefined;
		store.dateRange = (r.data?.dateRange as [string, string] | undefined) ?? null;
		onSearch();
	}).catch(() => undefined);
}
function removeFilter(key: string): void {
	if (key === "statusCode") store.statusCode = undefined;
	else store.dateRange = null;
	onSearch();
}

function onExport(): void {
	const cfg = EXPORT_CONFIGS.QUOT;
	POP.showPopup(ExportModal, { title: t(`${cfg.trKey}.PAGE_TITLE`), props: { config: cfg } }).promise.catch(() => undefined);
}

// Status may come back as a code (ACTIVE) or display name (Active).
const statusKey = (s?: string) => String(s ?? "").trim().toUpperCase();
function statusColor(s?: string): string {
	const k = statusKey(s);
	if (k === "ACTIVE") return "success";
	return k === "CONVERTED" || k === "SOLD" ? "primary" : "medium";
}
function statusLabel(s?: string): string {
	const k = statusKey(s);
	return store.statuses.includes(k) ? tr("STATUS_" + k) : String(s ?? "");
}
const openDetail = (no: string) => router.push(`/SAL15000?quotationNo=${encodeURIComponent(no)}`);
const openEdit = (no: string) => router.push(`/SAL17000?quotationNo=${encodeURIComponent(no)}`);
</script>

<style scoped>
.sl_chips { display: flex; flex-wrap: wrap; gap: 4px; padding: 0 8px 8px; }
.sl_total { display: flex; justify-content: space-between; padding: 8px 16px 0; font-size: 12px; color: var(--ion-color-medium); }
.sl_code { font-size: 10px; letter-spacing: .3px; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
