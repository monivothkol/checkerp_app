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
					<div class="stk_filters">
						<ion-select :value="store.inventoryId ?? ''" :placeholder="tr('ALL_INVENTORIES')" interface="action-sheet" @ion-change="onInventory($event.detail.value)">
							<ion-select-option value="">{{ tr("ALL_INVENTORIES") }}</ion-select-option>
							<ion-select-option v-for="i in store.inventories" :key="i.inventoryId" :value="i.inventoryId">{{ i.inventoryName }}</ion-select-option>
						</ion-select>
						<ion-select :value="store.movementType ?? ''" :placeholder="tr('ALL_TYPES')" interface="action-sheet" @ion-change="onType($event.detail.value)">
							<ion-select-option value="">{{ tr("ALL_TYPES") }}</ion-select-option>
							<ion-select-option v-for="ty in store.types" :key="ty" :value="ty">{{ tr("TYPE_" + ty) }}</ion-select-option>
						</ion-select>
					</div>
				</ion-toolbar>
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-note v-if="totalCount" class="stk_total">{{ $t("LIST.TOTAL_ITEMS", { total: totalCount }) }}</ion-note>
			<ion-list v-if="rows.length" class="scr_list">
				<ion-item v-for="(r, i) in rows" :key="`${r.referenceCode}-${r.productCode}-${i}`">
					<ion-label>
						<p class="stk_code">{{ r.movementDate }} · {{ r.referenceCode }}</p>
						<h2>{{ r.productName }}</h2>
						<p>{{ r.inventoryName }}</p>
						<ion-badge :color="typeColor(r.movementType)">{{ tr("TYPE_" + r.movementType) }}</ion-badge>
					</ion-label>
					<ion-note slot="end" :class="Number(r.quantityChange) >= 0 ? 'up' : 'down'">{{ signed(r.quantityChange) }}</ion-note>
				</ion-item>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />
			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)"><ion-infinite-scroll-content /></ion-infinite-scroll>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import type { InfiniteScrollCustomEvent, RefresherCustomEvent } from "@ionic/vue";
import { downloadOutline } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import ExportModal from "@/core/components/module/ExportModal.vue";
import { EXPORT_CONFIGS } from "@/core/modules/export-config";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { requestAsync, usePagedList } from "@/core/modules/use-paged-list";
import { STK40000Store } from "@/store/POS/STK/STK40000Store";
import type { HistoryRow, STK40000Response } from "@/models/POS/STK/STK40000";

/** Stock movement history: inventory/type filters, signed quantity change. */
defineOptions({ name: "STK40000" });

const { t } = useI18n();
const tr = (k: string) => t(`STK40000.${k}`);
const store = STK40000Store();
const signed = (v: unknown) => { const n = Number(v ?? 0); return n > 0 ? `+${n}` : String(n); };

const paged = usePagedList<HistoryRow>((pageNo, pageSize) => requestAsync<STK40000Response>((listener) => store.historyApi.request({
	dataBody: { searchKeyword: store.keyword, inventoryId: store.inventoryId, movementType: store.movementType, pageNo, pageSize },
	listener
})).then((p) => ({ list: p.historyList ?? [], totalCount: p.totalCount })));
const { rows, totalCount, loading, hasMore } = paged;
const reload = () => void paged.reload();

function onInventory(v: string): void { store.inventoryId = v || undefined; reload(); }
function onType(v: string): void { store.movementType = v || undefined; reload(); }
function typeColor(ty?: string): string {
	if (ty === "SALE") return "danger";
	if (ty === "PURCHASE" || ty === "TRANSFER_IN") return "success";
	return "primary";
}
function onExport(): void {
	const cfg = EXPORT_CONFIGS.STKH;
	POP.showPopup(ExportModal, { title: t(`${cfg.trKey}.PAGE_TITLE`), props: { config: cfg } }).promise.catch(() => undefined);
}
async function onRefresh(ev: RefresherCustomEvent): Promise<void> { await paged.reload(); await ev.target.complete(); }
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> { await paged.more(); await ev.target.complete(); }

onMounted(() => store.loadInventories());
useViewEnter(reload);
</script>

<style scoped>
.stk_filters { display: flex; gap: 8px; padding: 0 12px; }
.stk_filters ion-select { flex: 1; font-size: 14px; }
.stk_total { display: block; padding: 8px 16px 0; font-size: 12px; }
.stk_code { font-size: 12px; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
ion-badge { font-size: 10px; margin-top: 4px; }
.up { color: var(--ion-color-success); font-weight: 600; font-size: 14px; }
.down { color: var(--ion-color-danger); font-weight: 600; font-size: 14px; }
</style>
