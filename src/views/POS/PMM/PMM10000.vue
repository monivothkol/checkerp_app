<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #end>
				<ion-button :aria-label="$t('EXPORT.EXPORT')" @click="onExport">
					<ion-icon slot="icon-only" :icon="downloadOutline" />
				</ion-button>
			</template>
			<template #bottom>
				<ion-toolbar>
					<ion-searchbar v-model="store.keyword" :placeholder="tr('SEARCH_PLACEHOLDER')" :debounce="300" @ion-input="onSearch" />
				</ion-toolbar>
				<ion-toolbar>
					<ion-segment v-model="typeFilter" scrollable @ion-change="onFilter">
						<ion-segment-button value=""><ion-label>{{ tr("ALL_TYPES") }}</ion-label></ion-segment-button>
						<ion-segment-button v-for="ty in TYPES" :key="ty" :value="ty"><ion-label>{{ tr("TYPE_" + ty) }}</ion-label></ion-segment-button>
					</ion-segment>
				</ion-toolbar>
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)">
				<ion-refresher-content />
			</ion-refresher>

			<ion-list v-if="rows.length" class="scr_list">
				<ion-item v-for="r in rows" :key="r.promotionCode" button :detail="true" @click="openDetail(r.promotionCode)">
					<ion-label>
						<p class="pmm_code">{{ r.promotionCode }} · {{ tr("TYPE_" + r.promotionType) }}</p>
						<h2>{{ r.promotionName }}</h2>
						<p>{{ tr("COL_REWARD") }}: {{ rewardText(r) }}</p>
						<p>{{ tr("COL_PERIOD") }}: {{ period(r) }}</p>
					</ion-label>
					<ion-badge slot="end" :color="r.isActive ? 'success' : 'medium'">{{ r.isActive ? tr("ACTIVE") : tr("INACTIVE") }}</ion-badge>
				</ion-item>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />

			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)">
				<ion-infinite-scroll-content />
			</ion-infinite-scroll>

			<ion-fab slot="fixed" vertical="bottom" horizontal="end">
				<ion-fab-button :aria-label="tr('NEW')" @click="router.push('/PMM20000')">
					<ion-icon :icon="add" />
				</ion-fab-button>
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
import { requestAsync, usePagedList } from "@/core/modules/use-paged-list";
import { useViewEnter } from "@/core/modules/use-view-enter";
import RetrievePromotionList from "@/services/api/PMM/retrievePromotionList";
import { PMM10000Store } from "@/store/POS/PMM/PMM10000Store";
import type { PMM10000Response, PromotionRow } from "@/models/POS/PMM/PMM10000";

/** PMM10000 — promotion list: keyword + type filter, export, create. */
defineOptions({ name: "PMM10000" });

const TYPES = ["PERCENTAGE_DISCOUNT", "BUY_X_GET_Y", "BUNDLED_PACKAGE", "PRICE_OVERRIDE"];

const { t } = useI18n();
const router = useRouter();
const tr = (key: string) => t(`PMM10000.${key}`);
const store = PMM10000Store();
// Segment needs a string; "" = all types (store keeps undefined like the web's cleared select).
const typeFilter = ref(store.promotionType ?? "");

const paged = usePagedList<PromotionRow>((pageNo, pageSize) => requestAsync<PMM10000Response>((listener) =>
	RetrievePromotionList.getInstance().request({
		dataBody: { searchKeyword: store.keyword, promotionType: store.promotionType, pageNo, pageSize },
		listener
	})).then((p) => ({ list: p.promotionList ?? [], totalCount: p.totalCount })));
const { rows, loading, hasMore } = paged;

const onSearch = () => void paged.reload();
function onFilter(): void {
	store.promotionType = typeFilter.value || undefined;
	onSearch();
}
async function onRefresh(ev: RefresherCustomEvent): Promise<void> {
	await paged.reload();
	await ev.target.complete();
}
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> {
	await paged.more();
	await ev.target.complete();
}

function rewardText(r: PromotionRow): string {
	switch (r.promotionType) {
		case "PERCENTAGE_DISCOUNT": return `${Number(r.discountPercentage ?? 0)}%`;
		case "PRICE_OVERRIDE": return "$ " + UT.currency(r.discountPrice ?? 0, "USD");
		case "BUY_X_GET_Y": return `${tr("BUY")} ${r.buyQuantity ?? 0} ${tr("GET")} ${r.freeQuantity ?? 0}`;
		case "BUNDLED_PACKAGE": return tr("BUNDLE");
		default: return "—";
	}
}
function period(r: PromotionRow): string {
	const f = (d?: string) => (d ? String(d).slice(0, 10) : "");
	if (!r.startDate && !r.endDate) return tr("ALWAYS");
	return `${f(r.startDate) || "…"} → ${f(r.endDate) || "…"}`;
}
function onExport(): void {
	const cfg = EXPORT_CONFIGS.PMM;
	POP.showPopup(ExportModal, { title: t(`${cfg.trKey}.PAGE_TITLE`), props: { config: cfg } }).promise.catch(() => undefined);
}
function openDetail(promotionCode: string): void {
	router.push(`/PMM50000?promotionCode=${encodeURIComponent(promotionCode)}`);
}

// Reload on every visit so a just-created promotion shows up.
useViewEnter(onSearch);
</script>

<style scoped>
.pmm_code { font-size: 10px; letter-spacing: .3px; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
