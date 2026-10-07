<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/SFM10000" />

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<template v-if="store.detail">
				<ion-list class="scr_list" lines="full">
					<ion-item><ion-label><p>{{ tr("STAFF_CODE") }}</p><h3>{{ store.detail.staffCode }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("STAFF_NAME") }}</p><h3>{{ store.detail.staffName }}</h3></ion-label></ion-item>
				</ion-list>

				<div class="sfm_cards">
					<div class="sfm_card loan">
						<div class="sfm_card_label">{{ tr("LOAN") }}</div>
						<div class="sfm_card_val">{{ money(store.detail.loanBalance) }}</div>
						<div v-if="store.detail.loanRecommendedDeduction" class="sfm_card_sub">{{ tr("REC_DEDUCT") }}: {{ money(store.detail.loanRecommendedDeduction) }}</div>
					</div>
					<div class="sfm_card advance">
						<div class="sfm_card_label">{{ tr("ADVANCE") }}</div>
						<div class="sfm_card_val">{{ money(store.detail.advanceBalance) }}</div>
						<div v-if="store.detail.advanceRecommendedDeduction" class="sfm_card_sub">{{ tr("REC_DEDUCT") }}: {{ money(store.detail.advanceRecommendedDeduction) }}</div>
					</div>
					<div class="sfm_card deposit">
						<div class="sfm_card_label">{{ tr("DEPOSIT") }}</div>
						<div class="sfm_card_val">{{ money(store.detail.depositBalance) }}</div>
					</div>
				</div>

				<ion-list class="scr_list" lines="full">
					<ion-list-header>
						<ion-label>{{ tr("HISTORY") }}</ion-label>
					</ion-list-header>
					<ion-item>
						<ion-select v-model="store.accountType" :label="tr('COL_ACCOUNT')" label-placement="stacked" :placeholder="tr('ALL_TYPES')" interface="action-sheet" @ion-change="onFilter">
							<ion-select-option :value="undefined">{{ tr("ALL_TYPES") }}</ion-select-option>
							<ion-select-option v-for="o in typeOptions" :key="o" :value="o">{{ tr(o) }}</ion-select-option>
						</ion-select>
					</ion-item>
					<ion-item v-for="r in rows" :key="r.transactionId">
						<ion-label class="ion-text-wrap">
							<p class="sfm_code">{{ dateTime(r.trnDate) }}<template v-if="r.referenceNo"> · {{ r.referenceNo }}</template></p>
							<h3>{{ typeLabel(r.transactionType) }} <ion-badge color="tertiary">{{ r.accountType }}</ion-badge></h3>
							<p>{{ tr("COL_BALANCE") }}: {{ money(r.balanceAfter) }}</p>
							<p v-if="r.remark">{{ r.remark }}</p>
						</ion-label>
						<ion-note slot="end" :color="Number(r.signedAmount) < 0 ? 'danger' : 'success'" class="sfm_amt">{{ money(r.signedAmount) }}</ion-note>
					</ion-item>
					<ion-item v-if="!rows.length && !loading"><ion-note>—</ion-note></ion-item>
				</ion-list>
				<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)"><ion-infinite-scroll-content /></ion-infinite-scroll>
			</template>
			<bm-empty-state v-else-if="!store.loading" description="SFM20000.NOT_FOUND" />

			<ion-fab v-if="store.detail" slot="fixed" vertical="bottom" horizontal="end">
				<ion-fab-button @click="newTransaction"><ion-icon :icon="add" /></ion-fab-button>
			</ion-fab>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import type { InfiniteScrollCustomEvent, RefresherCustomEvent } from "@ionic/vue";
import { add } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import UT from "@/core/utilities/ut";
import DATE from "@/core/utilities/date";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { requestAsync, usePagedList } from "@/core/modules/use-paged-list";
import { SFM20000Store } from "@/store/POS/SFM/SFM20000Store";
import SFM30000 from "@/views/POS/SFM/SFM30000.vue";
import type { StaffFinancialTransaction, StaffFinancialTransactionsResponse } from "@/models/POS/SFM/SFM20000";

/** Staff financial detail: loan/advance/deposit balances + paged history; new transaction via SFM30000. */
defineOptions({ name: "SFM20000" });

const { t } = useI18n();
const route = useRoute();
const tr = (k: string) => t(`SFM20000.${k}`);
const store = SFM20000Store();
const typeOptions = ["LOAN", "ADVANCE", "DEPOSIT"];

const paged = usePagedList<StaffFinancialTransaction>((pageNo, pageSize) => requestAsync<StaffFinancialTransactionsResponse>((listener) =>
	store.txApi.request({ dataBody: { staffId: store.staffId, accountType: store.accountType || undefined, pageNo, pageSize }, listener }))
	.then((p) => ({ list: p.transactionList ?? [], totalCount: p.totalCount })));
const { rows, loading, hasMore } = paged;

/** Balances via the store; history via the paged list (the store's own page-1 load is superseded). */
function load(staffId: string): void {
	store.load(staffId);
	if (staffId) void paged.reload();
}
useViewEnter(() => load(String(route.query.staffId ?? "")));
const onFilter = () => void paged.reload();
async function onRefresh(ev: RefresherCustomEvent): Promise<void> { load(store.staffId); await ev.target.complete(); }
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> { await paged.more(); await ev.target.complete(); }

const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");
const dateTime = (v?: string | null) => (v ? DATE.setDateFormat(String(v).trim(), "DD MMM, YYYY HH:mm:ss") : "—");
const typeLabel = (v: string) => String(v ?? "").toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function newTransaction(): void {
	POP.showPopup(SFM30000, { title: tr("NEW_TRANSACTION"), props: { staffId: store.staffId } }).promise
		.then(() => load(store.staffId))
		.catch(() => undefined);
}
</script>

<style scoped>
.sfm_cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 8px 16px; }
.sfm_card { border: 1px solid var(--ion-color-light-shade); border-radius: 8px; padding: 8px; }
.sfm_card.loan { border-top: 4px solid #d4380d; }
.sfm_card.advance { border-top: 4px solid #d48806; }
.sfm_card.deposit { border-top: 4px solid #389e0d; }
.sfm_card_label { font-size: 10px; color: var(--ion-color-medium); text-transform: uppercase; }
.sfm_card_val { font-size: 14px; font-weight: 700; margin-top: 4px; font-variant-numeric: tabular-nums; }
.sfm_card_sub { font-size: 10px; color: var(--ion-color-medium); margin-top: 4px; }
.sfm_code { font-size: 12px; }
.sfm_amt { font-size: 14px; font-variant-numeric: tabular-nums; }
ion-label h3 { font-size: 14px; }
ion-label h3 ion-badge { font-size: 10px; }
ion-label p { font-size: 12px; }
</style>
