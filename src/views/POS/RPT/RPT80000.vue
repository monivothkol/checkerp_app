<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #end>
				<ion-button @click="onExport"><ion-icon slot="icon-only" :icon="downloadOutline" /></ion-button>
			</template>
			<template #bottom>
				<ion-toolbar>
					<ion-select v-model="store.status" class="r_sel" :placeholder="tr('ALL_STATUS')" interface="action-sheet" @ion-change="reload">
						<ion-select-option :value="undefined">{{ tr("ALL_STATUS") }}</ion-select-option>
						<ion-select-option v-for="s in STATUSES" :key="s" :value="s">{{ tr("STATUS_" + s) }}</ion-select-option>
					</ion-select>
				</ion-toolbar>
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-note v-if="totalCount" class="r_total">{{ $t("LIST.TOTAL_ITEMS", { total: totalCount }) }}</ion-note>
			<ion-list v-if="rows.length" class="scr_list" lines="full">
				<ion-item v-for="r in rows" :key="r.commissionId" button :detail="true" @click="openDetail(r.commissionId)">
					<ion-label>
						<p class="r_code">{{ r.commissionCode }} · {{ String(r.createdAt ?? "").slice(0, 10) }}</p>
						<h2>{{ label(r.criteriaType) }}</h2>
						<p>{{ tr("COL_APPLY_TO") }}: {{ label(r.applyToType) }} · {{ tr("COL_RECIPIENTS") }}: {{ r.recipientCount ?? 0 }}</p>
					</ion-label>
					<div slot="end" class="r_end">
						<b>{{ money(r.totalCommissionAmount) }}</b>
						<ion-badge :color="statusColor(r.status)">{{ tr("STATUS_" + r.status) }}</ion-badge>
					</div>
				</ion-item>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />
			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)"><ion-infinite-scroll-content /></ion-infinite-scroll>
			<ion-fab slot="fixed" vertical="bottom" horizontal="end">
				<ion-fab-button @click="onCalculate"><ion-icon :icon="add" /></ion-fab-button>
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
import { RPT80000Store } from "@/store/POS/RPT/RPT80000Store";
import RPT81000 from "@/views/POS/RPT/RPT81000.vue";
import type { CommissionListItem, CommissionListResponse } from "@/models/POS/RPT/RPT80000";

/** Commissions: status filter, open detail (approve/reject), calculate + save a new one, export. */
defineOptions({ name: "RPT80000" });

const STATUSES = ["PENDING", "APPROVED", "REJECTED"];
const { t, te } = useI18n();
const router = useRouter();
const tr = (key: string) => t(`RPT80000.${key}`);
const store = RPT80000Store();
const money = (v: unknown) => "$ " + UT.currency(Number(v ?? 0), "USD");
/** Enum label with the raw value as fallback (web: $t(key, default)). */
const label = (v?: string) => (!v ? "—" : te(`RPT80000.T_${v}`) ? t(`RPT80000.T_${v}`) : v);

const paged = usePagedList<CommissionListItem>((pageNo, pageSize) => requestAsync<CommissionListResponse>((listener) =>
	store.api.request({ dataBody: { pageNo, pageSize, status: store.status || undefined }, listener }))
	.then((p) => ({ list: p.commissionList ?? [], totalCount: p.totalCount })));
const { rows, totalCount, loading, hasMore } = paged;
const reload = () => void paged.reload();

function statusColor(s?: string): string {
	if (s === "APPROVED") return "success";
	return s === "REJECTED" ? "danger" : "medium";
}
async function onRefresh(ev: RefresherCustomEvent): Promise<void> {
	await paged.reload();
	await ev.target.complete();
}
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> {
	await paged.more();
	await ev.target.complete();
}
function onExport(): void {
	const cfg = EXPORT_CONFIGS.CMS;
	POP.showPopup(ExportModal, { title: t(`${cfg.trKey}.PAGE_TITLE`), props: { config: cfg } }).promise.catch(() => undefined);
}
function openDetail(commissionId: string): void {
	router.push(`/RPT82000?commissionId=${encodeURIComponent(commissionId)}`);
}
function onCalculate(): void {
	POP.showPopup(RPT81000, { title: tr("CALCULATE") }).promise.then(reload).catch(() => undefined);
}

useViewEnter(reload);
</script>

<style scoped>
.r_sel { padding: 0 16px; }
.r_total { display: block; padding: 8px 16px 0; font-size: 12px; }
.r_code { font-size: 10px; letter-spacing: .3px; }
.r_end { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; font-size: 14px; font-variant-numeric: tabular-nums; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
