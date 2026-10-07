<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #end>
				<ion-button @click="onExport"><ion-icon slot="icon-only" :icon="downloadOutline" /></ion-button>
			</template>
			<template #bottom>
				<ion-toolbar>
					<ion-searchbar v-model="store.keyword" :placeholder="tr('SEARCH_PLACEHOLDER')" :debounce="400" @ion-input="onSearch" />
				</ion-toolbar>
				<ion-toolbar>
					<ion-segment v-model="statusSeg" scrollable @ion-change="onStatus">
						<ion-segment-button value=""><ion-label>{{ tr("ALL_STATUS") }}</ion-label></ion-segment-button>
						<ion-segment-button v-for="s in store.statuses" :key="s" :value="s"><ion-label>{{ tr("STATUS_" + s) }}</ion-label></ion-segment-button>
					</ion-segment>
				</ion-toolbar>
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-note v-if="totalCount" class="sl_total">{{ $t("LIST.TOTAL_ITEMS", { total: totalCount }) }}</ion-note>

			<ion-list v-if="rows.length" class="scr_list">
				<ion-item-sliding v-for="r in rows" :key="r.packagingId">
					<ion-item button :detail="true" @click="openDetail(r.packagingId)">
						<ion-label>
							<p class="sl_code">{{ r.packagingCode }}</p>
							<h2>{{ tr("COL_SALE_CODE") }}: {{ r.saleCode || "—" }}</h2>
							<p>{{ tr("COL_PROGRESS") }}: {{ r.packedCount ?? 0 }}/{{ r.itemCount ?? 0 }} · {{ UT.localDateTime(r.createdAt) }}</p>
						</ion-label>
						<ion-badge slot="end" :color="statusColor(r.status)">{{ statusLabel(r.status) }}</ion-badge>
					</ion-item>
					<!-- Only an unstarted (PENDING) packaging can be edited. -->
					<ion-item-options v-if="statusKey(r.status) === 'PENDING'" side="end">
						<ion-item-option @click="openEdit(r.packagingId)">{{ tr("EDIT") }}</ion-item-option>
					</ion-item-options>
				</ion-item-sliding>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />

			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)"><ion-infinite-scroll-content /></ion-infinite-scroll>

			<ion-fab slot="fixed" vertical="bottom" horizontal="end">
				<ion-fab-button @click="router.push('/SAL31000')"><ion-icon :icon="add" /></ion-fab-button>
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
import RetrievePackagingList from "@/services/api/SAL/retrievePackagingList";
import type { PackagingRow, SAL30000Response } from "@/models/POS/SAL/SAL30000";
import { SAL30000Store } from "@/store/POS/SAL/SAL30000Store";

/** Packing list: search + status tabs; PENDING rows can be edited. */
defineOptions({ name: "SAL30000" });

const { t } = useI18n();
const tr = (k: string) => t(`SAL30000.${k}`);
const router = useRouter();
const store = SAL30000Store();
const statusSeg = ref(store.status ?? "");

const paged = usePagedList<PackagingRow>((pageNo, pageSize) => requestAsync<SAL30000Response>((listener) =>
	RetrievePackagingList.getInstance().request({
		dataBody: { status: store.status || undefined, searchKeyword: store.keyword || undefined, pageNo, pageSize },
		listener
	})).then((p) => ({ list: p.packagingList ?? [], totalCount: p.totalCount })));
const { rows, totalCount, loading, hasMore } = paged;
const onSearch = () => void paged.reload();
useViewEnter(onSearch);

function onStatus(): void {
	store.status = statusSeg.value || undefined;
	onSearch();
}
async function onRefresh(ev: RefresherCustomEvent): Promise<void> { await paged.reload(); await ev.target.complete(); }
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> { await paged.more(); await ev.target.complete(); }

function onExport(): void {
	const cfg = EXPORT_CONFIGS.PACK;
	POP.showPopup(ExportModal, { title: t(`${cfg.trKey}.PAGE_TITLE`), props: { config: cfg } }).promise.catch(() => undefined);
}
const statusKey = (s?: string) => String(s ?? "").trim().toUpperCase();
function statusColor(s?: string): string {
	const k = statusKey(s);
	if (k === "DONE") return "success";
	return k === "IN_PROGRESS" ? "primary" : "medium";
}
function statusLabel(s?: string): string {
	const k = statusKey(s);
	return store.statuses.includes(k) ? tr("STATUS_" + k) : String(s ?? "");
}
const openDetail = (id: string) => router.push(`/SAL34000?packagingId=${encodeURIComponent(id)}`);
const openEdit = (id: string) => router.push(`/SAL37000?packagingId=${encodeURIComponent(id)}`);
</script>

<style scoped>
.sl_total { display: block; padding: 8px 16px 0; font-size: 12px; }
.sl_code { font-size: 10px; letter-spacing: .3px; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
