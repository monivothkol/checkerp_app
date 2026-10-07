<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #end>
				<ion-button :aria-label="$t('EXPORT.EXPORT')" @click="onExport"><ion-icon slot="icon-only" :icon="downloadOutline" /></ion-button>
			</template>
			<template #bottom>
				<ion-toolbar>
					<ion-searchbar v-model="store.keyword" :placeholder="tr('SEARCH_PLACEHOLDER')" :debounce="300" @ion-input="reload" />
				</ion-toolbar>
				<ion-toolbar>
					<div class="dbt_filters">
						<ion-select :value="store.lenderType ?? ''" interface="action-sheet" @ion-change="store.lenderType = $event.detail.value || undefined; reload()">
							<ion-select-option value="">{{ tr("ALL_LENDERS") }}</ion-select-option>
							<ion-select-option v-for="v in LENDER_TYPES" :key="v" :value="v">{{ tr(v) }}</ion-select-option>
						</ion-select>
						<ion-select :value="store.status ?? ''" interface="action-sheet" @ion-change="store.status = $event.detail.value || undefined; reload()">
							<ion-select-option value="">{{ tr("ALL_STATUS") }}</ion-select-option>
							<ion-select-option v-for="v in STATUSES" :key="v" :value="v">{{ tr(v) }}</ion-select-option>
						</ion-select>
					</div>
				</ion-toolbar>
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<div class="act_cards">
				<div class="act_card">
					<div class="act_card_label">{{ tr("OUTSTANDING") }}</div>
					<div class="act_card_value">{{ money(store.totals?.outstanding) }}</div>
					<div class="act_card_hint">{{ tr("OF_PRINCIPAL") }} {{ money(store.totals?.principal) }}</div>
				</div>
				<div class="act_card"><div class="act_card_label">{{ tr("SHORT_TERM") }}</div><div class="act_card_value">{{ money(store.totals?.currentPortion) }}</div><div class="act_card_hint">{{ tr("DUE_12M") }}</div></div>
				<div class="act_card"><div class="act_card_label">{{ tr("LONG_TERM") }}</div><div class="act_card_value">{{ money(store.totals?.longTermPortion) }}</div><div class="act_card_hint">{{ tr("AFTER_12M") }}</div></div>
			</div>
			<ion-note v-if="totalCount" class="act_hint">{{ $t("LIST.TOTAL_ITEMS", { total: totalCount }) }}</ion-note>

			<ion-list v-if="rows.length" class="scr_list" lines="full">
				<ion-item v-for="r in rows" :key="r.loanId" button :detail="true" @click="openDetail(r.loanId)">
					<ion-label>
						<p>{{ r.loanCode }} · {{ tr(r.lenderType) }} · {{ r.startDate }}</p>
						<h2>{{ r.lenderName }}</h2>
						<p>{{ tr("COL_PRINCIPAL") }} {{ money(r.principal) }} · {{ Number(r.interestRate) }}% · {{ tr("COL_MONTHLY") }} {{ money(r.monthlyPayment) }}</p>
						<p>{{ tr("COL_SHORT") }} {{ money(r.currentPortion) }} · {{ tr("COL_LONG") }} {{ money(r.longTermPortion) }}</p>
					</ion-label>
					<div slot="end" class="dbt_end">
						<span class="act_amt act_bold">{{ money(r.outstanding) }}</span>
						<ion-badge :color="r.status === 'ACTIVE' ? 'success' : 'medium'">{{ tr(r.status) }}</ion-badge>
					</div>
				</ion-item>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />

			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)"><ion-infinite-scroll-content /></ion-infinite-scroll>
			<ion-fab slot="fixed" vertical="bottom" horizontal="end">
				<ion-fab-button :aria-label="tr('NEW_LOAN')" @click="router.push('/DBT20000')"><ion-icon :icon="add" /></ion-fab-button>
			</ion-fab>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import type { InfiniteScrollCustomEvent, RefresherCustomEvent } from "@ionic/vue";
import { add, downloadOutline } from "ionicons/icons";
import UT from "@/core/utilities/ut";
import POP from "@/core/utilities/pop";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { requestAsync, usePagedList } from "@/core/modules/use-paged-list";
import ExportModal from "@/core/components/module/ExportModal.vue";
import { EXPORT_CONFIGS } from "@/core/modules/export-config";
import RetrieveLoanList from "@/services/api/DBT/retrieveLoanList";
import { LENDER_TYPES, type DBT10000Response, type LoanRow } from "@/models/POS/DBT/DBT10000";
import { DBT10000Store } from "@/store/POS/DBT/DBT10000Store";

/** Loan register: outstanding/short/long-term cards, lender/status filters, export, tap = detail, FAB = new loan. */
defineOptions({ name: "DBT10000" });

const STATUSES = ["ACTIVE", "CLOSED"];
const { t } = useI18n();
const tr = (k: string) => t(`DBT10000.${k}`);
const router = useRouter();
const store = DBT10000Store();
const money = (v: unknown) => "$ " + UT.currency(Number(v ?? 0), "USD");

// Same request body as the store's reload(); the register totals ride on every page.
const paged = usePagedList<LoanRow>((pageNo, pageSize) => requestAsync<DBT10000Response>((listener) =>
	RetrieveLoanList.getInstance().request({
		dataBody: {
			searchKeyword: store.keyword || undefined,
			lenderType: store.lenderType || undefined,
			status: store.status || undefined,
			pageNo,
			pageSize
		},
		listener
	})).then((p) => {
	store.totals = p.totals;
	return { list: p.loanList ?? [], totalCount: p.totalCount };
}));
const { rows, totalCount, loading, hasMore } = paged;
const reload = () => void paged.reload();

useViewEnter(reload);
async function onRefresh(ev: RefresherCustomEvent): Promise<void> {
	await paged.reload();
	await ev.target.complete();
}
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> {
	await paged.more();
	await ev.target.complete();
}
function openDetail(loanId: string): void {
	router.push(`/DBT30000?loanId=${encodeURIComponent(loanId)}`);
}
function onExport(): void {
	const cfg = EXPORT_CONFIGS.DBT;
	POP.showPopup(ExportModal, {
		title: t(`${cfg.trKey}.PAGE_TITLE`),
		props: { config: cfg, params: { lenderType: store.lenderType, status: store.status } }
	}).promise.catch(() => undefined);
}
</script>

<style scoped src="../../ACT/act-report.css"></style>
<style scoped>
.dbt_filters { display: flex; gap: 8px; padding: 0 16px; }
.dbt_filters ion-select { flex: 1; min-width: 0; font-size: 14px; }
.dbt_end { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
</style>
