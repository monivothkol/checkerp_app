<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #bottom>
				<ion-toolbar>
					<div class="stk_filters">
						<ion-select v-model="store.withinDays" :disabled="store.expiredOnly" interface="action-sheet" @ion-change="reload">
							<ion-select-option :value="7">{{ tr("WITHIN_7") }}</ion-select-option>
							<ion-select-option :value="30">{{ tr("WITHIN_30") }}</ion-select-option>
							<ion-select-option :value="90">{{ tr("WITHIN_90") }}</ion-select-option>
						</ion-select>
						<ion-checkbox v-model="store.expiredOnly" label-placement="end" @ion-change="reload">{{ tr("EXPIRED_ONLY") }}</ion-checkbox>
					</div>
				</ion-toolbar>
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-note v-if="totalCount" class="stk_total">{{ $t("LIST.TOTAL_ITEMS", { total: totalCount }) }}</ion-note>
			<ion-list v-if="rows.length" class="scr_list">
				<ion-item v-for="(r, i) in rows" :key="r.batchId ?? i">
					<ion-label>
						<p class="stk_code">{{ r.productCode }} · {{ r.inventoryName }}</p>
						<h2>{{ r.productName }}</h2>
						<p>{{ tr("COL_BATCH") }} {{ r.batchNo || "—" }} · {{ tr("COL_COST") }} {{ money(r.unitCost) }}</p>
						<p :class="expiryClass(r.daysToExpiry)">{{ tr("COL_EXPIRY") }} {{ r.expiryDate || "—" }} · {{ tr("COL_DAYS_LEFT") }} {{ r.daysToExpiry ?? "—" }}</p>
					</ion-label>
					<ion-note slot="end" class="stk_qty">{{ num(r.quantityRemaining) }}</ion-note>
				</ion-item>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />
			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)"><ion-infinite-scroll-content /></ion-infinite-scroll>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { InfiniteScrollCustomEvent, RefresherCustomEvent } from "@ionic/vue";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { requestAsync, usePagedList } from "@/core/modules/use-paged-list";
import { STK50000Store } from "@/store/POS/STK/STK50000Store";
import type { ProductBatch } from "@/services/api/STK/retrieveProductBatches";

/** Expiry report: batches expiring within N days, or already expired. */
defineOptions({ name: "STK50000" });

interface ExpiryRow extends ProductBatch { productCode?: string; productName?: string }

const { t } = useI18n();
const tr = (k: string) => t(`STK50000.${k}`);
const store = STK50000Store();
const num = (v: unknown) => String(Number(v ?? 0));
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");

const paged = usePagedList<ExpiryRow>((pageNo, pageSize) => requestAsync<{ batchList?: ExpiryRow[]; totalCount?: number }>((listener) => store.api.request({
	dataBody: { withinDays: store.expiredOnly ? undefined : store.withinDays, expiredOnly: store.expiredOnly || undefined, pageNo, pageSize },
	listener
})).then((p) => ({ list: p.batchList ?? [], totalCount: p.totalCount })), 20);
const { rows, totalCount, loading, hasMore } = paged;
const reload = () => void paged.reload();

function expiryClass(days?: number): string {
	if (days == null) return "";
	if (days < 0) return "stk_exp_past";
	return days <= 7 ? "stk_exp_soon" : "";
}
async function onRefresh(ev: RefresherCustomEvent): Promise<void> { await paged.reload(); await ev.target.complete(); }
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> { await paged.more(); await ev.target.complete(); }

useViewEnter(reload);
</script>

<style scoped>
.stk_filters { display: flex; align-items: center; gap: 12px; padding: 0 12px; }
.stk_filters ion-select { flex: 1; font-size: 14px; }
.stk_filters ion-checkbox { font-size: 14px; }
.stk_total { display: block; padding: 8px 16px 0; font-size: 12px; }
.stk_code { font-size: 12px; }
.stk_qty { font-size: 16px; font-weight: 600; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
.stk_exp_past { color: var(--ion-color-danger) !important; font-weight: 700; }
.stk_exp_soon { color: var(--ion-color-warning-shade) !important; font-weight: 600; }
</style>
