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
					</div>
				</ion-toolbar>
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-note v-if="totalCount" class="pur_total">
				{{ $t("LIST.TOTAL_ITEMS", { total: totalCount }) }}<template v-if="totals"> · {{ tr("COL_TOTAL") }} {{ money(totals.grandTotal) }} · {{ tr("COL_PAID") }} {{ money(totals.paidAmount) }}</template>
			</ion-note>
			<ion-list v-if="rows.length" class="scr_list">
				<ion-item-sliding v-for="r in rows" :key="r.adjustmentId">
					<ion-item button :detail="true" @click="openDetail(r.adjustmentId)">
						<ion-label>
							<p class="pur_code">{{ r.adjustmentCode }}<template v-if="r.poCode"> · {{ tr("COL_PO") }} {{ r.poCode }}</template></p>
							<h2>{{ r.supplierName || "—" }}</h2>
							<p>{{ tr("COL_INVENTORY") }}: {{ r.inventoryName || "—" }} · {{ tr("COL_ITEMS") }}: {{ r.itemCount ?? 0 }}</p>
							<p>{{ tr("COL_DATE") }}: {{ fmtDate(r.adjustedAt) }}</p>
							<h3>{{ money(r.grandTotal) }} <span class="pur_paid">· {{ tr("COL_PAID") }} {{ money(r.paidAmount) }}</span></h3>
						</ion-label>
						<div slot="end" class="pur_badges">
							<ion-badge :color="statusColor(r.status)">{{ tr("STATUS_" + r.status) }}</ion-badge>
							<ion-badge :color="receivedColor(r.receivedStatus)">{{ tr("RECEIVED_" + r.receivedStatus) }}</ion-badge>
						</div>
					</ion-item>
					<ion-item-options v-if="r.status === 'PENDING'" side="end">
						<ion-item-option color="success" @click="onReceive(r)">{{ tr("RECEIVE") }}</ion-item-option>
					</ion-item-options>
				</ion-item-sliding>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />
			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)"><ion-infinite-scroll-content /></ion-infinite-scroll>

			<ion-fab slot="fixed" vertical="bottom" horizontal="end">
				<ion-fab-button @click="router.push('/PUR21000')"><ion-icon :icon="add" /></ion-fab-button>
			</ion-fab>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
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
import { PUR20000Store } from "@/store/POS/PUR/PUR20000Store";
import type { PUR20000ListTotals, PUR20000Response, PurchaseInRow } from "@/models/POS/PUR/PUR20000";

/** Purchase-in (goods receipt) list: search, status filter, totals; swipe a PENDING row to receive. */
defineOptions({ name: "PUR20000" });

const { t } = useI18n();
const tr = (k: string) => t(`PUR20000.${k}`);
const router = useRouter();
const store = PUR20000Store();
const totals = ref<PUR20000ListTotals | null>(null);
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");
const fmtDate = (d?: string) => (d ? String(d).replace("T", " ").slice(0, 16) : "—");

const paged = usePagedList<PurchaseInRow>((pageNo, pageSize) => requestAsync<PUR20000Response>((listener) => store.purchaseInApi.request({
	dataBody: { pageNo, pageSize, status: store.status, searchKeyword: store.keyword },
	listener
})).then((p) => { totals.value = p.totals ?? null; return { list: p.purchaseInList ?? [], totalCount: p.totalCount }; }));
const { rows, totalCount, loading, hasMore } = paged;
const reload = () => void paged.reload();
// store.receive() refreshes its own page on success; mirror that into the scroll list.
store.$onAction(({ name, after }) => { if (name === "reload") after(reload); });

function onStatus(v: string): void { store.status = v || undefined; reload(); }
function statusColor(s: string): string {
	if (s === "APPROVED" || s === "RECEIVED") return "success";
	if (s === "REJECTED" || s === "CANCELLED") return "danger";
	return "medium";
}
function receivedColor(s: string): string {
	if (s === "RECEIVED") return "success";
	if (s === "PARTIAL_RECEIVED") return "warning";
	return "medium";
}
function openDetail(id: string): void { router.push(`/PUR24000?adjustmentId=${encodeURIComponent(id)}`); }
function onReceive(r: PurchaseInRow): void {
	POP.confirm({
		title: tr("RECEIVE"),
		content: tr("RECEIVE_CONFIRM").replace("{code}", r.adjustmentCode ?? ""),
		okBtn: { btnText: tr("RECEIVE"), onClick: () => store.receive(r.adjustmentId, { done: tr("RECEIVED_DONE"), failed: tr("RECEIVE_FAILED") }) }
	});
}
function onExport(): void {
	const cfg = EXPORT_CONFIGS.PIN;
	POP.showPopup(ExportModal, { title: t(`${cfg.trKey}.PAGE_TITLE`), props: { config: cfg } }).promise.catch(() => undefined);
}
async function onRefresh(ev: RefresherCustomEvent): Promise<void> { await paged.reload(); await ev.target.complete(); }
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> { await paged.more(); await ev.target.complete(); }

useViewEnter(reload);
</script>

<style scoped>
.pur_filters { display: flex; gap: 8px; padding: 0 12px; }
.pur_filters ion-select { flex: 1; font-size: 14px; }
.pur_total { display: block; padding: 8px 16px 0; font-size: 12px; }
.pur_code { font-size: 12px; }
.pur_paid { font-size: 12px; font-weight: 400; }
.pur_badges { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
ion-label h2, ion-label h3 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
