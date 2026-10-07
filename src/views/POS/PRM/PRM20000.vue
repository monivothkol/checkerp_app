<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #end>
				<ion-button @click="onExport"><ion-icon slot="icon-only" :icon="downloadOutline" /></ion-button>
			</template>
			<template #bottom>
				<ion-toolbar>
					<div class="prm_filters">
						<ion-input v-model="store.effectiveMonth" type="month" :label="tr('COL_MONTH')" label-placement="stacked" :clear-input="true" @ion-change="onFilter" />
						<ion-select v-model="store.status" :label="tr('COL_STATUS')" label-placement="stacked" :placeholder="tr('ALL_STATUS')" interface="action-sheet" @ion-change="onFilter">
							<ion-select-option :value="undefined">{{ tr("ALL_STATUS") }}</ion-select-option>
							<ion-select-option value="PENDING">{{ tr("STATUS_PENDING") }}</ion-select-option>
							<ion-select-option value="CONSUMED">{{ tr("STATUS_CONSUMED") }}</ion-select-option>
						</ion-select>
					</div>
				</ion-toolbar>
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-note v-if="totalCount" class="prm_total">{{ $t("LIST.TOTAL_ITEMS", { total: totalCount }) }}</ion-note>
			<ion-list v-if="rows.length" class="scr_list">
				<ion-item v-for="r in rows" :key="r.adjustmentId" button :detail="true" @click="openDetail(r.adjustmentId)">
					<ion-label>
						<p class="prm_code">{{ r.effectiveMonth }} · {{ String(r.createdAt ?? "").slice(0, 10) }}</p>
						<h2>{{ r.staffName }}</h2>
						<p>{{ r.typeName }} · <ion-text :color="r.category === 'EARNING' ? 'success' : 'danger'">{{ tr("CAT_" + r.category) }}</ion-text></p>
						<p><strong>$ {{ UT.currency(r.amount ?? 0, "USD") }}</strong><template v-if="r.remark"> · {{ r.remark }}</template></p>
					</ion-label>
					<ion-badge slot="end" :color="r.status === 'CONSUMED' ? 'success' : 'medium'">{{ tr("STATUS_" + r.status) }}</ion-badge>
				</ion-item>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />
			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)"><ion-infinite-scroll-content /></ion-infinite-scroll>

			<ion-fab slot="fixed" vertical="bottom" horizontal="end">
				<ion-fab-button @click="router.push('/PRM21000')"><ion-icon :icon="add" /></ion-fab-button>
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
import { PRM20000Store } from "@/store/POS/PRM/PRM20000Store";
import type { AdjustmentRow, PRM20000Response } from "@/models/POS/PRM/PRM20000";

/** Payroll adjustments: month/status filters, create via PRM21000. */
defineOptions({ name: "PRM20000" });

const { t } = useI18n();
const router = useRouter();
const tr = (k: string) => t(`PRM20000.${k}`);
const store = PRM20000Store();

const paged = usePagedList<AdjustmentRow>((pageNo, pageSize) => requestAsync<PRM20000Response>((listener) =>
	store.adjustmentApi.request({ dataBody: { pageNo, pageSize, effectiveMonth: store.effectiveMonth || undefined, status: store.status }, listener }))
	.then((p) => ({ list: p.adjustmentList ?? [], totalCount: p.totalCount })));
const { rows, totalCount, loading, hasMore } = paged;

const onFilter = () => void paged.reload();
async function onRefresh(ev: RefresherCustomEvent): Promise<void> { await paged.reload(); await ev.target.complete(); }
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> { await paged.more(); await ev.target.complete(); }

function openDetail(id: string): void {
	router.push(`/PRM24000?adjustmentId=${encodeURIComponent(id)}`);
}
function onExport(): void {
	const cfg = EXPORT_CONFIGS.PRMA;
	POP.showPopup(ExportModal, { title: t(`${cfg.trKey}.PAGE_TITLE`), props: { config: cfg } }).promise.catch(() => undefined);
}

useViewEnter(onFilter);
</script>

<style scoped>
.prm_filters { display: flex; gap: 8px; padding: 0 8px; }
.prm_filters > * { flex: 1; }
.prm_total { display: block; padding: 8px 16px 0; font-size: 12px; }
.prm_code { font-size: 12px; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
