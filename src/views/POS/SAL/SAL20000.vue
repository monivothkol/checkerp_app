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
				<span v-if="store.totals">{{ $t("LIST.GRAND_TOTAL") }}: $ {{ UT.currency(store.totals.totalRefund ?? 0, "USD") }}</span>
			</div>

			<ion-list v-if="rows.length" class="scr_list">
				<ion-item-sliding v-for="r in rows" :key="r.returnId">
					<ion-item button :detail="true" @click="openDetail(r.returnId)">
						<ion-label>
							<p class="sl_code">{{ r.returnCode }} · {{ r.saleCode }}</p>
							<h2>{{ r.customerName || "—" }}</h2>
							<p>{{ tr("COL_REFUND") }}: $ {{ UT.currency(r.totalRefund ?? 0, "USD") }} · {{ tr("COL_ITEMS") }}: {{ r.itemCount ?? 0 }}</p>
							<p>{{ UT.localDateTime(r.returnedAt) }}</p>
						</ion-label>
						<ion-badge slot="end" :color="statusColor(r.status)">{{ tr("STATUS_" + r.status) }}</ion-badge>
					</ion-item>
					<ion-item-options v-if="r.status === 'PENDING'" side="end">
						<ion-item-option @click="openEdit(r.returnId)">{{ tr("EDIT") }}</ion-item-option>
						<ion-item-option color="success" @click="onApprove(r)">{{ tr("APPROVE") }}</ion-item-option>
						<ion-item-option color="danger" @click="onReject(r)">{{ tr("REJECT") }}</ion-item-option>
					</ion-item-options>
				</ion-item-sliding>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />

			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)"><ion-infinite-scroll-content /></ion-infinite-scroll>

			<ion-fab slot="fixed" vertical="bottom" horizontal="end">
				<ion-fab-button @click="router.push('/SAL21000')"><ion-icon :icon="add" /></ion-fab-button>
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
import RetrieveSaleReturnList from "@/services/api/SAL/retrieveSaleReturnList";
import type { ReturnRow, SAL20000Response } from "@/models/POS/SAL/SAL20000";
import { SAL20000Store } from "@/store/POS/SAL/SAL20000Store";

/** Sale-return list: search + status/creator/inventory/date filters; PENDING rows can be edited, approved or rejected. */
defineOptions({ name: "SAL20000" });

const { t } = useI18n();
const tr = (k: string) => t(`SAL20000.${k}`);
const router = useRouter();
const store = SAL20000Store();

const paged = usePagedList<ReturnRow>((pageNo, pageSize) => requestAsync<SAL20000Response>((listener) =>
	RetrieveSaleReturnList.getInstance().request({
		dataBody: {
			searchKeyword: store.keyword, status: store.status,
			inventoryId: store.inventoryId || undefined,
			createdBy: store.createdBy || undefined,
			dateFrom: store.dateRange?.[0] || undefined,
			dateTo: store.dateRange?.[1] || undefined,
			pageNo, pageSize
		},
		listener
	})).then((p) => {
		store.totals = p.totals ?? null;
		store.users = p.creators ?? [];
		return { list: p.returnList ?? [], totalCount: p.totalCount };
	}));
const { rows, totalCount, loading, hasMore } = paged;
const onSearch = () => void paged.reload();
// approve/reject end in store.reload(); mirror it into the paged list.
// ponytail: store.reload also fetches its own (unused) page — one extra request per approve/reject.
store.$onAction(({ name, after }) => { if (name === "reload") after(onSearch); });
useViewEnter(() => { onSearch(); store.loadLookups(); });

async function onRefresh(ev: RefresherCustomEvent): Promise<void> { await paged.reload(); await ev.target.complete(); }
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> { await paged.more(); await ev.target.complete(); }

type FilterKey = "status" | "createdBy" | "inventoryId" | "dateRange";
const filterDefs = computed<ModuleListFilter[]>(() => {
	const defs: ModuleListFilter[] = [
		{ key: "status", labelKey: "COL_STATUS", options: store.statuses.map((s) => ({ value: s, label: tr("STATUS_" + s) })) }
	];
	// Created By only appears when the users list loaded.
	if (store.users.length) {
		defs.push({ key: "createdBy", labelKey: "CREATED_BY", options: store.users.map((u) => ({ value: u.userId, label: u.fullName || u.username || "" })) });
	}
	defs.push({ key: "inventoryId", labelKey: "ALL_INVENTORY", options: store.inventories.map((i) => ({ value: i.inventoryId, label: i.inventoryName ?? "" })) });
	defs.push({ key: "dateRange", labelKey: "COL_DATE", type: "dateRange" });
	return defs;
});
function currentValues(): Record<FilterKey, unknown> {
	return { status: store.status, createdBy: store.createdBy, inventoryId: store.inventoryId, dateRange: store.dateRange ?? undefined };
}
const chips = computed(() => {
	const v = currentValues();
	return filterDefs.value.filter((f) => v[f.key as FilterKey] != null && v[f.key as FilterKey] !== "").map((f) => {
		const val = v[f.key as FilterKey];
		const label = Array.isArray(val) ? `${val[0]} – ${val[1]}` : f.options?.find((o) => o.value === val)?.label ?? String(val);
		return { key: f.key as FilterKey, label: tr(f.labelKey), value: label };
	});
});
function setFilters(v: Record<string, unknown>): void {
	store.inventoryId = v.inventoryId as string | undefined;
	store.dateRange = (v.dateRange as [string, string] | undefined) ?? null;
	store.status = v.status as string | undefined;
	store.createdBy = v.createdBy as string | undefined;
	onSearch();
}
function onOpenFilter(): void {
	const optionsByKey: Record<string, { value: unknown; label: string }[]> = {};
	for (const f of filterDefs.value) optionsByKey[f.key] = f.options ?? [];
	POP.showPopup<Record<string, unknown>>(ModuleFilterPanel, {
		title: t("LIST.FILTER"),
		props: { filters: filterDefs.value, values: currentValues(), optionsByKey, listTr: "SAL20000" }
	}).promise.then((r) => setFilters(r.data ?? {})).catch(() => undefined);
}
function removeFilter(key: FilterKey): void {
	setFilters({ ...currentValues(), [key]: undefined });
}

function onExport(): void {
	const cfg = EXPORT_CONFIGS.SALR;
	POP.showPopup(ExportModal, { title: t(`${cfg.trKey}.PAGE_TITLE`), props: { config: cfg } }).promise.catch(() => undefined);
}
function statusColor(s?: string): string {
	if (s === "APPROVED") return "success";
	return s === "REJECTED" ? "danger" : "medium";
}
function onApprove(r: ReturnRow): void {
	POP.confirm({
		title: tr("APPROVE"),
		content: tr("APPROVE_CONFIRM").replace("{code}", r.returnCode ?? ""),
		okBtn: {
			btnText: tr("APPROVE"),
			onClick: () => store.approve(r.returnId, { done: tr("APPROVED_DONE"), failed: tr("ACTION_FAILED"), creditNote: tr("CREDIT_NOTE_ISSUED") })
		}
	});
}
function onReject(r: ReturnRow): void {
	POP.confirm({
		title: tr("REJECT"),
		content: tr("REJECT_CONFIRM").replace("{code}", r.returnCode ?? ""),
		okBtn: { btnText: tr("REJECT"), onClick: () => store.reject(r.returnId, tr("ACTION_FAILED")) }
	});
}
const openDetail = (id: string) => router.push(`/SAL24000?returnId=${encodeURIComponent(id)}`);
const openEdit = (id: string) => router.push(`/SAL27000?returnId=${encodeURIComponent(id)}`);
</script>

<style scoped>
.sl_chips { display: flex; flex-wrap: wrap; gap: 4px; padding: 0 8px 8px; }
.sl_total { display: flex; justify-content: space-between; padding: 8px 16px 0; font-size: 12px; color: var(--ion-color-medium); }
.sl_code { font-size: 10px; letter-spacing: .3px; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
