<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #end>
				<ion-button @click="onExport"><ion-icon slot="icon-only" :icon="downloadOutline" /></ion-button>
				<ion-button @click="router.push('/TRB10000')"><ion-icon slot="icon-only" :icon="trashOutline" /></ion-button>
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
					</div>
				</ion-toolbar>
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-note v-if="totalCount" class="stk_total">{{ $t("LIST.TOTAL_ITEMS", { total: totalCount }) }}</ion-note>
			<ion-list v-if="rows.length" class="scr_list">
				<ion-item v-for="(r, i) in rows" :key="`${r.productCode}-${r.inventoryName}-${r.variantId ?? ''}-${i}`" button :detail="true" @click="openDetail(r.productCode)">
					<ion-label>
						<p class="stk_code">{{ r.productCode }} · {{ r.inventoryName || "—" }}</p>
						<h2>{{ r.productName }}<template v-if="r.variantName"> — {{ r.variantName }}</template></h2>
						<p>{{ tr("COL_AVAILABLE") }} {{ num(r.availableQuantity) }} · {{ tr("COL_ON_HOLD") }} {{ num(r.onHoldStock) }}</p>
						<p>{{ tr("COL_AVG_COST") }} {{ money(r.averageCost) }}</p>
					</ion-label>
					<div slot="end" class="stk_end">
						<strong>{{ num(r.quantity) }}</strong>
						<ion-badge v-if="r.productActive === false" color="medium">{{ tr("INACTIVE") }}</ion-badge>
					</div>
				</ion-item>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />
			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)"><ion-infinite-scroll-content /></ion-infinite-scroll>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import type { InfiniteScrollCustomEvent, RefresherCustomEvent } from "@ionic/vue";
import { downloadOutline, trashOutline } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import UT from "@/core/utilities/ut";
import ExportModal from "@/core/components/module/ExportModal.vue";
import { EXPORT_CONFIGS } from "@/core/modules/export-config";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { requestAsync, usePagedList } from "@/core/modules/use-paged-list";
import { STK10000Store } from "@/store/POS/STK/STK10000Store";
import type { STK10000Response, StockRow } from "@/models/POS/STK/STK10000";

/** Stock on hand per product/variant/inventory (Excel import stays web-only). */
defineOptions({ name: "STK10000" });

const { t } = useI18n();
const tr = (k: string) => t(`STK10000.${k}`);
const router = useRouter();
const store = STK10000Store();
const num = (v: unknown) => String(Number(v ?? 0));
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");

const paged = usePagedList<StockRow>((pageNo, pageSize) => requestAsync<STK10000Response>((listener) => store.stockApi.request({
	dataBody: { searchKeyword: store.keyword, inventoryId: store.inventoryId, isActive: true, pageNo, pageSize },
	listener
})).then((p) => ({ list: p.stockList ?? [], totalCount: p.totalCount })));
const { rows, totalCount, loading, hasMore } = paged;
const reload = () => void paged.reload();

function onInventory(v: string): void { store.inventoryId = v || undefined; reload(); }
function openDetail(code?: string): void { router.push(`/STK13000?productCode=${encodeURIComponent(code ?? "")}`); }
function onExport(): void {
	POP.showPopup(ExportModal, { title: t("STK12000.PAGE_TITLE"), props: { config: EXPORT_CONFIGS.STK } }).promise.catch(() => undefined);
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
.stk_end { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; font-size: 16px; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
