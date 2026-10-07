<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #bottom>
				<ion-toolbar>
					<ion-searchbar v-model="store.keyword" :placeholder="tr('SEARCH')" :debounce="300" @ion-input="reload" />
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
			<ion-note v-if="totalCount" class="pur_total">{{ $t("LIST.TOTAL_ITEMS", { total: totalCount }) }}</ion-note>
			<ion-list v-if="rows.length" class="scr_list">
				<ion-item v-for="r in rows" :key="r.adjustmentId" button :detail="true" @click="onDetail(r)">
					<ion-label>
						<p class="pur_code">{{ r.adjustmentCode }} · {{ fmtDate(r.adjustedAt) }}</p>
						<h2>{{ r.supplierName || "—" }}</h2>
						<p>{{ tr("COL_INVENTORY") }}: {{ r.inventoryName || "—" }} · {{ tr("COL_ITEMS") }}: {{ r.itemCount ?? 0 }}</p>
						<h3>{{ money(r.grandTotal) }}</h3>
					</ion-label>
					<ion-badge slot="end" :color="statusColor(r.status)">{{ tr("STATUS_" + r.status) }}</ion-badge>
				</ion-item>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />
			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)"><ion-infinite-scroll-content /></ion-infinite-scroll>

			<ion-fab slot="fixed" vertical="bottom" horizontal="end">
				<ion-fab-button @click="onCreate"><ion-icon :icon="add" /></ion-fab-button>
			</ion-fab>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { InfiniteScrollCustomEvent, RefresherCustomEvent } from "@ionic/vue";
import { add } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { requestAsync, usePagedList } from "@/core/modules/use-paged-list";
import { PUR30000Store } from "@/store/POS/PUR/PUR30000Store";
import PurchaseReturnCreateModal from "@/views/POS/PUR/PurchaseReturnCreateModal.vue";
import PurchaseReturnDetailModal from "@/views/POS/PUR/PurchaseReturnDetailModal.vue";
import type { PUR30000Response, PurchaseReturnRow } from "@/models/POS/PUR/PUR30000";

/** Return-to-supplier list; create and detail (approve/reject) open as sheets. */
defineOptions({ name: "PUR30000" });

const { t } = useI18n();
const tr = (k: string) => t(`PUR30000.${k}`);
const store = PUR30000Store();
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");
const fmtDate = (d?: string) => (d ? String(d).replace("T", " ").slice(0, 16) : "—");

const paged = usePagedList<PurchaseReturnRow>((pageNo, pageSize) => requestAsync<PUR30000Response>((listener) => store.listApi.request({
	dataBody: { searchKeyword: store.keyword, status: store.status, pageNo, pageSize },
	listener
})).then((p) => ({ list: p.purchaseReturnList ?? [], totalCount: p.totalCount })));
const { rows, totalCount, loading, hasMore } = paged;
const reload = () => void paged.reload();
// store.decide() refreshes its own page after approve/reject; mirror that here.
store.$onAction(({ name, after }) => { if (name === "reload") after(reload); });

function onStatus(v: string): void { store.status = v || undefined; reload(); }
function statusColor(s?: string): string {
	if (s === "APPROVED") return "success";
	if (s === "REJECTED") return "danger";
	return "medium";
}
function onCreate(): void {
	POP.showPopup(PurchaseReturnCreateModal, { title: tr("NEW") }).promise.then(() => {
		POP.openNotification({ type: "success", content: tr("CREATED_MSG") });
		reload();
	}).catch(() => undefined);
}
function onDetail(r: PurchaseReturnRow): void {
	POP.showPopup(PurchaseReturnDetailModal, { title: tr("DETAIL_TITLE"), props: { adjustmentId: r.adjustmentId } })
		.promise.then(reload).catch(() => undefined);
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
ion-label h2, ion-label h3 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
