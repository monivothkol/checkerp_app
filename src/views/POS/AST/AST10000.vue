<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #end>
				<ion-button :aria-label="$t('EXPORT.EXPORT')" @click="onExport"><ion-icon slot="icon-only" :icon="downloadOutline" /></ion-button>
			</template>
			<template #bottom>
				<ion-toolbar>
					<ion-searchbar v-model="store.keyword" :placeholder="tr('SEARCH_PLACEHOLDER')" :debounce="300" @ion-input="reload" />
				</ion-toolbar>
				<ion-toolbar>
					<div class="ast_filters">
						<ion-select :value="store.assetClass ?? ''" interface="action-sheet" @ion-change="store.assetClass = $event.detail.value || undefined; reload()">
							<ion-select-option value="">{{ tr("ALL_CLASSES") }}</ion-select-option>
							<ion-select-option v-for="v in CLASSES" :key="v" :value="v">{{ tr(v) }}</ion-select-option>
						</ion-select>
						<ion-select :value="store.assetType ?? ''" interface="action-sheet" @ion-change="store.assetType = $event.detail.value || undefined; reload()">
							<ion-select-option value="">{{ tr("ALL_TYPES") }}</ion-select-option>
							<ion-select-option v-for="v in ASSET_TYPES" :key="v" :value="v">{{ tr(v) }}</ion-select-option>
						</ion-select>
						<ion-select :value="store.status ?? ''" interface="action-sheet" @ion-change="store.status = $event.detail.value || undefined; reload()">
							<ion-select-option value="">{{ tr("ALL_STATUS") }}</ion-select-option>
							<ion-select-option v-for="v in STATUSES" :key="v" :value="v">{{ tr(v) }}</ion-select-option>
						</ion-select>
					</div>
				</ion-toolbar>
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<!-- computed (from other modules) + recorded (this register) -->
			<div class="act_cards">
				<div class="act_card"><div class="act_card_label">{{ tr("CASH") }}</div><div class="act_card_value">{{ money(store.computed?.cash) }}</div><div class="act_card_hint">{{ tr("COMPUTED") }}</div></div>
				<div class="act_card"><div class="act_card_label">{{ tr("RECEIVABLES") }}</div><div class="act_card_value">{{ money(store.computed?.accountsReceivable) }}</div><div class="act_card_hint">{{ tr("COMPUTED") }}</div></div>
				<div class="act_card"><div class="act_card_label">{{ tr("INVENTORY") }}</div><div class="act_card_value">{{ money(store.computed?.inventoryValue) }}</div><div class="act_card_hint">{{ tr("COMPUTED") }}</div></div>
				<div class="act_card">
					<div class="act_card_label">{{ tr("RECORDED_NBV") }}</div>
					<div class="act_card_value">{{ money(store.totals?.netBookValue) }}</div>
					<div class="act_card_hint">{{ tr("COST") }} {{ money(store.totals?.cost) }} · {{ tr("DEPRECIATED") }} {{ money(store.totals?.accumulatedDepreciation) }}</div>
				</div>
			</div>
			<ion-note v-if="totalCount" class="act_hint">{{ $t("LIST.TOTAL_ITEMS", { total: totalCount }) }}</ion-note>

			<ion-list v-if="rows.length" class="scr_list" lines="full">
				<ion-item v-for="r in rows" :key="r.assetId" button :detail="true" @click="openDetail(r.assetId)">
					<ion-label>
						<p>{{ r.assetCode }} · {{ tr(r.assetType) }} · {{ tr(r.assetClass) }}</p>
						<h2>{{ r.assetName }}</h2>
						<p>{{ tr("COL_PURCHASED") }} {{ r.purchaseDate }} · {{ tr("COL_COST") }} {{ money(r.cost) }}</p>
						<p>{{ tr("COL_DEPRECIATED") }} {{ money(r.accumulatedDepreciation) }}</p>
					</ion-label>
					<div slot="end" class="ast_end">
						<span class="act_amt act_bold">{{ money(r.netBookValue) }}</span>
						<ion-badge :color="r.status === 'ACTIVE' ? 'success' : 'medium'">{{ tr(r.status) }}</ion-badge>
					</div>
				</ion-item>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />

			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)"><ion-infinite-scroll-content /></ion-infinite-scroll>
			<ion-fab slot="fixed" vertical="bottom" horizontal="end">
				<ion-fab-button :aria-label="tr('NEW_ASSET')" @click="router.push('/AST20000')"><ion-icon :icon="add" /></ion-fab-button>
			</ion-fab>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import type { InfiniteScrollCustomEvent, RefresherCustomEvent } from "@ionic/vue";
import { add, downloadOutline } from "ionicons/icons";
import UT from "@/core/utilities/ut";
import POP from "@/core/utilities/pop";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { requestAsync, usePagedList } from "@/core/modules/use-paged-list";
import ExportModal from "@/core/components/module/ExportModal.vue";
import { EXPORT_CONFIGS } from "@/core/modules/export-config";
import RetrieveAssetList from "@/services/api/AST/retrieveAssetList";
import { ASSET_TYPES, type AssetRow, type AST10000Response } from "@/models/POS/AST/AST10000";
import { AST10000Store } from "@/store/POS/AST/AST10000Store";

/** Asset register: computed cash/AR/stock + recorded NBV cards, filters, export, tap = detail, FAB = record. */
defineOptions({ name: "AST10000" });

const CLASSES = ["CURRENT", "NON_CURRENT"];
const STATUSES = ["ACTIVE", "DISPOSED"];
const { t } = useI18n();
const tr = (k: string) => t(`AST10000.${k}`);
const router = useRouter();
const store = AST10000Store();
const money = (v: unknown) => "$ " + UT.currency(Number(v ?? 0), "USD");

// Same request body as the store's reload(); the register totals ride on every page.
const paged = usePagedList<AssetRow>((pageNo, pageSize) => requestAsync<AST10000Response>((listener) =>
	RetrieveAssetList.getInstance().request({
		dataBody: {
			searchKeyword: store.keyword || undefined,
			assetClass: store.assetClass || undefined,
			assetType: store.assetType || undefined,
			status: store.status || undefined,
			pageNo,
			pageSize
		},
		listener
	})).then((p) => {
	store.totals = p.totals;
	return { list: p.assetList ?? [], totalCount: p.totalCount };
}));
const { rows, totalCount, loading, hasMore } = paged;
const reload = () => void paged.reload();

useViewEnter(() => {
	store.loadComputed();
	reload();
});
async function onRefresh(ev: RefresherCustomEvent): Promise<void> {
	store.loadComputed();
	await paged.reload();
	await ev.target.complete();
}
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> {
	await paged.more();
	await ev.target.complete();
}
function openDetail(assetId: string): void {
	router.push(`/AST30000?assetId=${encodeURIComponent(assetId)}`);
}
function onExport(): void {
	const cfg = EXPORT_CONFIGS.AST;
	POP.showPopup(ExportModal, {
		title: t(`${cfg.trKey}.PAGE_TITLE`),
		props: { config: cfg, params: { assetClass: store.assetClass, assetType: store.assetType, status: store.status } }
	}).promise.catch(() => undefined);
}
</script>

<style scoped src="../../ACT/act-report.css"></style>
<style scoped>
.ast_filters { display: flex; gap: 4px; padding: 0 8px; }
.ast_filters ion-select { flex: 1; min-width: 0; font-size: 12px; }
.ast_end { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
</style>
