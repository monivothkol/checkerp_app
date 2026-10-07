<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #end>
				<ion-button @click="onExport"><ion-icon slot="icon-only" :icon="downloadOutline" /></ion-button>
			</template>
			<template #bottom>
				<ion-toolbar>
					<div class="prm_filters">
						<ion-input v-model="store.periodMonth" type="month" :label="tr('COL_MONTH')" label-placement="stacked" :clear-input="true" @ion-change="onFilter" />
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
			<p class="prm_note">{{ tr("V1_NOTE") }}</p>
			<div v-if="store.totals" class="prm_totals">
				<span>{{ $t("LIST.GRAND_TOTAL") }}</span>
				<span>{{ tr("COL_GROSS") }}: {{ UT.currency(store.totals.totalGross ?? 0, "USD") }}</span>
				<span>{{ tr("COL_DEDUCTION") }}: {{ UT.currency(store.totals.totalDeduction ?? 0, "USD") }}</span>
				<strong>{{ tr("COL_NET") }}: {{ UT.currency(store.totals.totalNet ?? 0, "USD") }}</strong>
			</div>

			<ion-list v-if="rows.length" class="scr_list">
				<ion-item v-for="r in rows" :key="r.runId" button :detail="true" @click="openDetail(r.runId)">
					<ion-label>
						<p class="prm_code">{{ r.periodMonth }} · {{ String(r.createdAt ?? "").slice(0, 10) }}</p>
						<h2>{{ r.departmentName || tr("ALL_DEPARTMENTS") }}</h2>
						<p>{{ tr("COL_EMPLOYEES") }}: {{ r.employeeCount ?? 0 }} · {{ tr("COL_GROSS") }}: {{ UT.currency(r.totalGross ?? 0, "USD") }}</p>
						<p>{{ tr("COL_DEDUCTION") }}: {{ UT.currency(r.totalDeduction ?? 0, "USD") }} · <strong>{{ tr("COL_NET") }}: {{ UT.currency(r.totalNet ?? 0, "USD") }}</strong></p>
					</ion-label>
					<ion-badge slot="end" :color="statusColor(r.status)">{{ tr("STATUS_" + r.status) }}</ion-badge>
				</ion-item>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />

			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)"><ion-infinite-scroll-content /></ion-infinite-scroll>

			<ion-fab slot="fixed" vertical="bottom" horizontal="end">
				<ion-fab-button @click="onNewRun"><ion-icon :icon="add" /></ion-fab-button>
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
import UT from "@/core/utilities/ut";
import ExportModal from "@/core/components/module/ExportModal.vue";
import { EXPORT_CONFIGS } from "@/core/modules/export-config";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { requestAsync, usePagedList } from "@/core/modules/use-paged-list";
import { PRM10000Store } from "@/store/POS/PRM/PRM10000Store";
import PRM11000 from "@/views/POS/PRM/PRM11000.vue";
import type { PayrollRunRow, PRM10000Response } from "@/models/POS/PRM/PRM10000";

/** Payroll runs: month/status filters, grand totals, new run sheet. */
defineOptions({ name: "PRM10000" });

const { t } = useI18n();
const router = useRouter();
const tr = (k: string) => t(`PRM10000.${k}`);
const store = PRM10000Store();

const paged = usePagedList<PayrollRunRow>((pageNo, pageSize) => requestAsync<PRM10000Response>((listener) =>
	store.runApi.request({ dataBody: { pageNo, pageSize, periodMonth: store.periodMonth || undefined, status: store.status }, listener }))
	.then((p) => {
		store.totals = p.totals ?? null;
		return { list: p.runList ?? [], totalCount: p.totalCount };
	}));
const { rows, loading, hasMore } = paged;

const onFilter = () => void paged.reload();
async function onRefresh(ev: RefresherCustomEvent): Promise<void> { await paged.reload(); await ev.target.complete(); }
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> { await paged.more(); await ev.target.complete(); }

function statusColor(s: string): string {
	if (s === "FINALIZED") return "success";
	return s === "VOID" ? "danger" : "medium";
}
function openDetail(runId: string): void {
	router.push(`/PRM14000?runId=${encodeURIComponent(runId)}`);
}
function onExport(): void {
	const cfg = EXPORT_CONFIGS.PRMR;
	POP.showPopup(ExportModal, { title: t(`${cfg.trKey}.PAGE_TITLE`), props: { config: cfg } }).promise.catch(() => undefined);
}
function onNewRun(): void {
	POP.showPopup<string>(PRM11000, { title: tr("NEW_RUN") }).promise
		.then((res) => { if (res.data) openDetail(res.data); else onFilter(); })
		.catch(() => undefined);
}

useViewEnter(onFilter);
</script>

<style scoped>
.prm_filters { display: flex; gap: 8px; padding: 0 8px; }
.prm_filters > * { flex: 1; }
.prm_note { font-size: 12px; color: var(--ion-color-medium); margin: 8px 16px 0; }
.prm_totals { display: flex; flex-wrap: wrap; gap: 4px 12px; margin: 8px 16px 0; padding: 8px 12px; border-radius: 8px; background: var(--ion-color-light); font-size: 12px; }
.prm_code { font-size: 12px; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
