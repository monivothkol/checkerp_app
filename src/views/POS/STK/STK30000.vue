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
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-note v-if="totalCount" class="stk_total">{{ $t("LIST.TOTAL_ITEMS", { total: totalCount }) }}</ion-note>
			<ion-list v-if="rows.length" class="scr_list">
				<ion-item v-for="r in rows" :key="r.adjustmentCode" button :detail="true" @click="openDetail(r.adjustmentCode)">
					<ion-label>
						<p class="stk_code">{{ r.adjustmentCode }} · {{ r.createdAt ?? "—" }}</p>
						<h2>{{ r.inventoryName || "—" }}</h2>
						<p>{{ tr("COL_REASON") }}: {{ r.reason || "—" }} · {{ tr("COL_ITEMS") }}: {{ r.itemCount ?? 0 }}</p>
					</ion-label>
					<ion-badge slot="end" :color="stColor(r.status)">{{ stLabel(r.status) }}</ion-badge>
				</ion-item>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />
			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)"><ion-infinite-scroll-content /></ion-infinite-scroll>

			<ion-fab slot="fixed" vertical="bottom" horizontal="end">
				<ion-fab-button @click="router.push('/STK31000')"><ion-icon :icon="add" /></ion-fab-button>
			</ion-fab>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import type { InfiniteScrollCustomEvent, RefresherCustomEvent } from "@ionic/vue";
import { add, downloadOutline } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import ExportModal from "@/core/components/module/ExportModal.vue";
import { EXPORT_CONFIGS } from "@/core/modules/export-config";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { requestAsync, usePagedList } from "@/core/modules/use-paged-list";
import { STK30000Store } from "@/store/POS/STK/STK30000Store";
import type { STK30000Response, AdjustmentRow } from "@/models/POS/STK/STK30000";

/** Stock adjustment list (inventory, reason, status). */
defineOptions({ name: "STK30000" });

const { t } = useI18n();
const tr = (k: string) => t(`STK30000.${k}`);
const router = useRouter();
const store = STK30000Store();

const paged = usePagedList<AdjustmentRow>((pageNo, pageSize) => requestAsync<STK30000Response>((listener) => store.adjustmentApi.request({
	dataBody: { searchKeyword: store.keyword, pageNo, pageSize },
	listener
})).then((p) => ({ list: p.adjustmentList ?? [], totalCount: p.totalCount })));
const { rows, totalCount, loading, hasMore } = paged;
const reload = () => void paged.reload();

function stColor(s?: string): string {
	const k = String(s ?? "").toUpperCase();
	if (k === "APPROVED") return "success";
	return k === "PENDING" ? "primary" : "medium";
}
function stLabel(s?: string): string {
	const k = String(s ?? "").toUpperCase();
	return ["APPROVED", "PENDING", "CANCELLED"].includes(k) ? tr("STATUS_" + k) : String(s ?? "");
}
function openDetail(code: string): void { router.push(`/STK33000?adjustmentCode=${encodeURIComponent(code)}`); }
function onExport(): void {
	const cfg = EXPORT_CONFIGS.STKA;
	POP.showPopup(ExportModal, { title: t(`${cfg.trKey}.PAGE_TITLE`), props: { config: cfg } }).promise.catch(() => undefined);
}
async function onRefresh(ev: RefresherCustomEvent): Promise<void> { await paged.reload(); await ev.target.complete(); }
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> { await paged.more(); await ev.target.complete(); }

useViewEnter(reload);
</script>

<style scoped>
.stk_total { display: block; padding: 8px 16px 0; font-size: 12px; }
.stk_code { font-size: 12px; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
