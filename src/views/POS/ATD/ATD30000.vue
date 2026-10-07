<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #end>
				<ion-button @click="onExport"><ion-icon slot="icon-only" :icon="downloadOutline" /></ion-button>
			</template>
			<template #bottom>
				<ion-toolbar>
					<ion-searchbar v-model="store.keyword" :placeholder="tr('SEARCH_PLACEHOLDER')" :debounce="300" @ion-input="onSearch" />
				</ion-toolbar>
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-note v-if="totalCount" class="atd_total">{{ $t("LIST.TOTAL_ITEMS", { total: totalCount }) }}</ion-note>
			<ion-list v-if="rows.length" class="scr_list">
				<ion-item v-for="r in rows" :key="r.scheduleId" button :detail="true" @click="openDetail(r.scheduleId)">
					<ion-label>
						<p class="atd_code">{{ r.scheduleCode }}</p>
						<h2>
							{{ r.name }}
							<span v-if="r.nameKhmer" class="atd_khmer">{{ r.nameKhmer }}</span>
							<ion-badge v-if="r.isDefault" color="tertiary">{{ tr("DEFAULT") }}</ion-badge>
						</h2>
						<p>{{ hhmm(r.startTime) }} – {{ hhmm(r.endTime) }} · {{ breakText(r) }}</p>
						<p>{{ daysText(r.workingDays) }} · {{ tr("COL_STAFF") }}: {{ Number(r.assignedStaffCount ?? 0) }}</p>
					</ion-label>
					<ion-badge slot="end" :color="r.isActive ? 'success' : 'medium'">{{ r.isActive ? tr("ACTIVE") : tr("INACTIVE") }}</ion-badge>
				</ion-item>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />
			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)"><ion-infinite-scroll-content /></ion-infinite-scroll>

			<ion-fab slot="fixed" vertical="bottom" horizontal="end">
				<ion-fab-button @click="router.push('/ATD31000')"><ion-icon :icon="add" /></ion-fab-button>
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
import { ATD30000Store } from "@/store/POS/ATD/ATD30000Store";
import type { ScheduleRow, ATD30000Response } from "@/models/POS/ATD/ATD30000";

/** Work schedules: search, create via ATD31000. */
defineOptions({ name: "ATD30000" });

const { t } = useI18n();
const router = useRouter();
const tr = (k: string) => t(`ATD30000.${k}`);
const store = ATD30000Store();

const paged = usePagedList<ScheduleRow>((pageNo, pageSize) => requestAsync<ATD30000Response>((listener) =>
	store.scheduleApi.request({ dataBody: { pageNo, pageSize, searchKeyword: store.keyword }, listener }))
	.then((p) => ({ list: p.scheduleList ?? [], totalCount: p.totalCount })));
const { rows, totalCount, loading, hasMore } = paged;

const onSearch = () => void paged.reload();
async function onRefresh(ev: RefresherCustomEvent): Promise<void> { await paged.reload(); await ev.target.complete(); }
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> { await paged.more(); await ev.target.complete(); }

const hhmm = (v: unknown) => (String(v ?? "") ? String(v).slice(0, 5) : "—");
function breakText(r: ScheduleRow): string {
	if (!r.breakType || r.breakType === "NONE") return tr("BREAK_NONE");
	return `${tr("BREAK_" + r.breakType)} · ${Number(r.breakMinutes ?? 0)}${tr("MIN_SUFFIX")}`;
}
// workingDays is a JSON string like "[1,2,3,4,5]" with 1=Mon .. 7=Sun.
function daysText(v: unknown): string {
	let days: number[] = [];
	try { days = JSON.parse(String(v ?? "[]")); } catch { days = []; }
	if (!Array.isArray(days) || !days.length) return "—";
	return days.map((d) => tr("DAY_" + d)).join(", ");
}
function openDetail(id: string): void {
	router.push(`/ATD34000?scheduleId=${encodeURIComponent(id)}`);
}
function onExport(): void {
	const cfg = EXPORT_CONFIGS.ATDS;
	POP.showPopup(ExportModal, { title: t(`${cfg.trKey}.PAGE_TITLE`), props: { config: cfg } }).promise.catch(() => undefined);
}

useViewEnter(onSearch);
</script>

<style scoped>
.atd_total { display: block; padding: 8px 16px 0; font-size: 12px; }
.atd_code { font-size: 12px; }
.atd_khmer { font-size: 12px; color: var(--ion-color-medium); margin-left: 4px; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label h2 ion-badge { margin-left: 4px; font-size: 10px; }
ion-label p { font-size: 12px; }
</style>
