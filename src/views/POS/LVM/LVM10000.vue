<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #end>
				<ion-button @click="onExport"><ion-icon slot="icon-only" :icon="downloadOutline" /></ion-button>
				<ion-button @click="onLinks"><ion-icon slot="icon-only" :icon="ellipsisVertical" /></ion-button>
			</template>
			<template #bottom>
				<ion-toolbar>
					<ion-segment :value="store.mode" @ion-change="onMode(String($event.detail.value))">
						<ion-segment-button value="all"><ion-label>{{ tr("TAB_ALL") }}</ion-label></ion-segment-button>
						<ion-segment-button value="inbox"><ion-label>{{ tr("TAB_INBOX") }}</ion-label></ion-segment-button>
					</ion-segment>
				</ion-toolbar>
				<ion-toolbar v-if="store.mode === 'all'">
					<div class="lvm_filters">
						<ion-select v-model="store.staffId" :label="tr('COL_STAFF')" label-placement="stacked" :placeholder="tr('ALL_STAFF')" interface="alert" :interface-options="{ header: tr('COL_STAFF') }" @ion-change="onFilter">
							<ion-select-option :value="undefined">{{ tr("ALL_STAFF") }}</ion-select-option>
							<ion-select-option v-for="s in store.staffOptions" :key="s.id" :value="s.id">{{ s.name }}</ion-select-option>
						</ion-select>
						<ion-select v-model="store.status" :label="tr('COL_STATUS')" label-placement="stacked" :placeholder="tr('ALL_STATUS')" interface="action-sheet" @ion-change="onFilter">
							<ion-select-option :value="undefined">{{ tr("ALL_STATUS") }}</ion-select-option>
							<ion-select-option v-for="s in store.statuses" :key="s" :value="s">{{ tr("STATUS_" + s) }}</ion-select-option>
						</ion-select>
					</div>
				</ion-toolbar>
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<div class="lvm_note"><ion-icon :icon="informationCircleOutline" /> {{ tr("APPROVAL_NOTE") }}</div>
			<ion-list v-if="rows.length" class="scr_list">
				<ion-item v-for="r in rows" :key="r.requestId" button :detail="true" @click="openDetail(r.requestId)">
					<ion-label>
						<p class="lvm_code">{{ r.staffCode }} · {{ dateTime(r.createdAt) }}</p>
						<h2>{{ r.staffName }}</h2>
						<p>{{ r.leaveTypeName }} · {{ r.startDate }} → {{ r.endDate }}</p>
						<p>{{ tr("COL_DAYS") }}: {{ r.totalDays }} <ion-badge v-if="r.isHalfDay" color="tertiary">{{ tr("HALF_DAY") }}</ion-badge></p>
					</ion-label>
					<ion-badge slot="end" :color="statusColor(r.status)">{{ tr("STATUS_" + r.status) }}</ion-badge>
				</ion-item>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />
			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)"><ion-infinite-scroll-content /></ion-infinite-scroll>

			<ion-fab slot="fixed" vertical="bottom" horizontal="end">
				<ion-fab-button @click="router.push('/LVM11000')"><ion-icon :icon="add" /></ion-fab-button>
			</ion-fab>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import type { InfiniteScrollCustomEvent, RefresherCustomEvent } from "@ionic/vue";
import { add, downloadOutline, ellipsisVertical, informationCircleOutline } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import DATE from "@/core/utilities/date";
import ExportModal from "@/core/components/module/ExportModal.vue";
import { EXPORT_CONFIGS } from "@/core/modules/export-config";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { requestAsync, usePagedList } from "@/core/modules/use-paged-list";
import { LVM10000Store } from "@/store/POS/LVM/LVM10000Store";
import type { LeaveRequestRow, LVM10000Response, PendingApprovalsResponse } from "@/models/POS/LVM/LVM10000";

/** Leave requests: all (staff/status filters, paged) or my approval inbox (PENDING awaiting me, unpaged). */
defineOptions({ name: "LVM10000" });

const { t } = useI18n();
const router = useRouter();
const tr = (k: string) => t(`LVM10000.${k}`);
const store = LVM10000Store();

const paged = usePagedList<LeaveRequestRow>((pageNo, pageSize) => store.mode === "inbox"
	? requestAsync<PendingApprovalsResponse>((listener) => store.pendingApi.request({ dataBody: {}, listener }))
		.then((p) => ({ list: p.requestList ?? [], totalCount: (p.requestList ?? []).length }))
	: requestAsync<LVM10000Response>((listener) => store.listApi.request({ dataBody: { pageNo, pageSize, staffId: store.staffId, status: store.status }, listener }))
		.then((p) => ({ list: p.requestList ?? [], totalCount: p.totalCount })));
const { rows, loading, hasMore } = paged;

const onFilter = () => void paged.reload();
function onMode(mode: string): void {
	store.mode = mode === "inbox" ? "inbox" : "all";
	onFilter();
}
async function onRefresh(ev: RefresherCustomEvent): Promise<void> { await paged.reload(); await ev.target.complete(); }
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> { await paged.more(); await ev.target.complete(); }

const dateTime = (v?: string | null) => (v ? DATE.setDateFormat(String(v).trim(), "DD MMM, YYYY HH:mm:ss") : "—");
function statusColor(s: string): string {
	if (s === "APPROVED") return "success";
	return s === "REJECTED" ? "danger" : "medium";
}
function openDetail(id: string): void {
	router.push(`/LVM14000?requestId=${encodeURIComponent(id)}`);
}
function onExport(): void {
	const cfg = EXPORT_CONFIGS.LVR;
	POP.showPopup(ExportModal, { title: t(`${cfg.trKey}.PAGE_TITLE`), props: { config: cfg } }).promise.catch(() => undefined);
}
/** Header links of the web page: leave types + holidays. */
function onLinks(): void {
	void POP.choose<string>({ options: [{ text: tr("LEAVE_TYPES"), value: "/LVM20000" }, { text: tr("HOLIDAYS"), value: "/LVM30000" }] })
		.then((to) => { if (to) router.push(to); });
}

useViewEnter(() => { store.loadStaff(); onFilter(); });
</script>

<style scoped>
.lvm_filters { display: flex; gap: 8px; padding: 0 8px; }
.lvm_filters > * { flex: 1; min-width: 0; }
.lvm_note { display: flex; align-items: center; gap: 8px; margin: 8px 16px 0; padding: 8px 12px; border-radius: 8px; background: #FFF7E6; color: #8A5A00; font-size: 12px; font-weight: 600; }
.lvm_code { font-size: 12px; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
ion-label p ion-badge { font-size: 10px; }
</style>
