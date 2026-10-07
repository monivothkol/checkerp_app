<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #end>
				<ion-button @click="onExport"><ion-icon slot="icon-only" :icon="downloadOutline" /></ion-button>
			</template>
			<template #bottom>
				<ion-toolbar>
					<div class="atd_filters">
						<ion-input v-model="from" type="date" :label="`${tr('COL_DATE')} ▸`" label-placement="stacked" @ion-change="onRange" />
						<ion-input v-model="to" type="date" :label="`${tr('COL_DATE')} ◂`" label-placement="stacked" @ion-change="onRange" />
					</div>
					<div class="atd_filters">
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
			<div v-if="store.summary.length" class="atd_stats">
				<ion-chip color="primary">{{ tr("TOTAL") }} <strong>{{ store.summaryTotal }}</strong></ion-chip>
				<ion-chip v-for="s in store.summary" :key="s.status" :color="statusColor(s.status)">{{ tr("STATUS_" + s.status) }} <strong>{{ s.count }}</strong></ion-chip>
			</div>

			<ion-list v-if="rows.length" class="scr_list">
				<ion-item v-for="r in rows" :key="r.attendanceId" button :detail="true" @click="openDetail(r.attendanceId)">
					<ion-label>
						<p class="atd_code">{{ String(r.date ?? "").slice(0, 10) }} · {{ r.staffCode }}</p>
						<h2>{{ r.staffName }}</h2>
						<p>{{ tr("COL_IN") }} {{ hhmm(r.checkIn) }} · {{ tr("COL_BREAK") }} {{ hhmm(r.breakCheckOut) }} / {{ hhmm(r.breakCheckIn) }} · {{ tr("COL_OUT") }} {{ hhmm(r.checkOut) }}</p>
						<p>{{ tr("COL_WORKED") }}: {{ fmtMinutes(r.workedMinutes) }} · {{ tr("COL_LATE") }}: {{ Number(r.lateMinutes ?? 0) > 0 ? fmtMinutes(r.lateMinutes) : "—" }} · {{ r.source ?? "—" }}</p>
					</ion-label>
					<ion-badge slot="end" :color="statusColor(r.status)">{{ tr("STATUS_" + r.status) }}</ion-badge>
				</ion-item>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />
			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)"><ion-infinite-scroll-content /></ion-infinite-scroll>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import type { InfiniteScrollCustomEvent, RefresherCustomEvent } from "@ionic/vue";
import { downloadOutline } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import ExportModal from "@/core/components/module/ExportModal.vue";
import { EXPORT_CONFIGS } from "@/core/modules/export-config";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { requestAsync, usePagedList } from "@/core/modules/use-paged-list";
import { ATD10000Store } from "@/store/POS/ATD/ATD10000Store";
import type { AttendanceRow, ATD10000Response, ATD15000Response } from "@/models/POS/ATD/ATD10000";

/** Attendance list: date range (default today) + status filters, per-status summary chips. */
defineOptions({ name: "ATD10000" });

const { t } = useI18n();
const router = useRouter();
const tr = (k: string) => t(`ATD10000.${k}`);
const store = ATD10000Store();
const from = ref(store.dateRange?.[0] ?? "");
const to = ref(store.dateRange?.[1] ?? "");

const paged = usePagedList<AttendanceRow>((pageNo, pageSize) => requestAsync<ATD10000Response>((listener) =>
	store.listApi.request({ dataBody: { pageNo, pageSize, ...store.filterBody }, listener }))
	.then((p) => ({ list: p.attendanceList ?? [], totalCount: p.totalCount })));
const { rows, loading, hasMore } = paged;

function loadSummary(): void {
	store.summaryApi.request({
		dataBody: { ...store.filterBody },
		listener: {
			onSuccess: (p: ATD15000Response) => { store.summary = p.summary ?? []; store.summaryTotal = p.total ?? 0; },
			onFail: () => { store.summary = []; store.summaryTotal = 0; }
		}
	});
}
function onFilter(): void {
	void paged.reload();
	loadSummary();
}
// A range needs both ends (web range picker); both cleared = no date filter.
function onRange(): void {
	if (from.value && to.value) store.dateRange = [from.value, to.value];
	else if (!from.value && !to.value) store.dateRange = null;
	else return;
	onFilter();
}
async function onRefresh(ev: RefresherCustomEvent): Promise<void> { onFilter(); await ev.target.complete(); }
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> { await paged.more(); await ev.target.complete(); }

function hhmm(v: unknown): string {
	const s = String(v ?? "");
	if (!s) return "—";
	const time = s.includes("T") ? s.split("T")[1] : s.includes(" ") ? s.split(" ")[1] : s;
	return time ? time.slice(0, 5) : "—";
}
function fmtMinutes(v: unknown): string {
	const m = Number(v ?? 0);
	return m ? `${Math.floor(m / 60)}h ${m % 60}m` : "—";
}
function statusColor(s: string): string {
	if (s === "PRESENT") return "success";
	return s === "LATE" ? "warning" : "medium";
}
function openDetail(id: string): void {
	router.push(`/ATD14000?attendanceId=${encodeURIComponent(id)}`);
}
function onExport(): void {
	const cfg = EXPORT_CONFIGS.ATD;
	POP.showPopup(ExportModal, { title: t(`${cfg.trKey}.PAGE_TITLE`), props: { config: cfg } }).promise.catch(() => undefined);
}

useViewEnter(onFilter);
</script>

<style scoped>
.atd_filters { display: flex; gap: 8px; padding: 0 8px; }
.atd_filters > * { flex: 1; min-width: 0; }
.atd_stats { display: flex; flex-wrap: wrap; gap: 4px; padding: 8px 12px 0; }
.atd_stats ion-chip { font-size: 12px; margin: 0; }
.atd_stats strong { margin-left: 4px; }
.atd_code { font-size: 12px; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
