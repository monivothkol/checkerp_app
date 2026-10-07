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
				<ion-item-sliding v-for="r in rows" :key="r.deliveryId">
					<ion-item button :detail="true" @click="openDetail(r.deliveryId)">
						<ion-label>
							<p class="sl_code">{{ r.deliveryCode }} · {{ r.saleCode || "—" }}</p>
							<h2>{{ r.customerName || "—" }}</h2>
							<p v-if="r.scheduledDate">{{ tr("COL_SCHEDULED") }}: {{ UT.localDateTime(r.scheduledDate) }}</p>
							<p>{{ tr("COL_CREATED_AT") }}: {{ UT.localDateTime(r.createdAt) }}</p>
						</ion-label>
						<ion-badge slot="end" :color="statusColor(r.status)">{{ statusLabel(r.status) }}</ion-badge>
					</ion-item>
					<!-- Only a PENDING delivery can be edited. -->
					<ion-item-options v-if="statusKey(r.status) === 'PENDING'" side="end">
						<ion-item-option @click="openEdit(r.deliveryId)">{{ tr("EDIT") }}</ion-item-option>
					</ion-item-options>
				</ion-item-sliding>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />

			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)"><ion-infinite-scroll-content /></ion-infinite-scroll>

			<ion-fab slot="fixed" vertical="bottom" horizontal="end">
				<ion-fab-button @click="router.push('/SAL41000')"><ion-icon :icon="add" /></ion-fab-button>
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
import RetrieveDeliveryList from "@/services/api/SAL/retrieveDeliveryList";
import type { DeliveryRow, SAL40000Response } from "@/models/POS/SAL/SAL40000";
import { SAL40000Store } from "@/store/POS/SAL/SAL40000Store";

/** Delivery list: search + status tabs; PENDING rows can be edited. */
defineOptions({ name: "SAL40000" });

const { t } = useI18n();
const tr = (k: string) => t(`SAL40000.${k}`);
const router = useRouter();
const store = SAL40000Store();
const statusSeg = ref(store.status ?? "");

const paged = usePagedList<DeliveryRow>((pageNo, pageSize) => requestAsync<SAL40000Response>((listener) =>
	RetrieveDeliveryList.getInstance().request({
		dataBody: { status: store.status || undefined, searchKeyword: store.keyword || undefined, pageNo, pageSize },
		listener
	})).then((p) => ({ list: p.deliveryList ?? [], totalCount: p.totalCount })));
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
	const cfg = EXPORT_CONFIGS.DLV;
	POP.showPopup(ExportModal, { title: t(`${cfg.trKey}.PAGE_TITLE`), props: { config: cfg } }).promise.catch(() => undefined);
}
const statusKey = (s?: string) => String(s ?? "").trim().toUpperCase();
function statusColor(s?: string): string {
	const k = statusKey(s);
	if (k === "DELIVERED") return "success";
	return k === "PICKED_UP" ? "primary" : "medium";
}
function statusLabel(s?: string): string {
	const k = statusKey(s);
	return store.statuses.includes(k) ? tr("STATUS_" + k) : String(s ?? "");
}
const openDetail = (id: string) => router.push(`/SAL74000?deliveryId=${encodeURIComponent(id)}`);
const openEdit = (id: string) => router.push(`/SAL47000?deliveryId=${encodeURIComponent(id)}`);
</script>

<style scoped>
.sl_total { display: block; padding: 8px 16px 0; font-size: 12px; }
.sl_code { font-size: 10px; letter-spacing: .3px; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
