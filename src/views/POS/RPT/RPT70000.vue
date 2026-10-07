<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #bottom>
				<ion-toolbar>
					<ion-searchbar v-model="store.keyword" :placeholder="tr('SEARCH')" :debounce="300" @ion-input="reload" />
				</ion-toolbar>
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ReportCards :cards="cards" />
			<ion-list v-if="rows.length" class="scr_list" lines="full">
				<ion-item v-for="r in rows" :key="r.customerId">
					<ion-label>
						<p class="r_code">{{ r.customerCode }}<template v-if="r.policyName"> · {{ r.policyName }}</template></p>
						<h2>{{ r.customerName }}</h2>
						<p>{{ tr("COL_LIMIT") }}: {{ r.effectiveCreditLimit != null ? money(r.effectiveCreditLimit) : "—" }}</p>
						<p :class="Number(r.overdueAmount ?? 0) > 0 ? 'r_bad' : ''">{{ tr("COL_OVERDUE") }}: {{ money(r.overdueAmount) }} · {{ tr("COL_OVERDUE_DAYS") }}: {{ r.maxOverdueDays ?? "—" }}</p>
					</ion-label>
					<div slot="end" class="r_end">
						<small>{{ tr("COL_OUTSTANDING") }}</small>
						<b>{{ money(r.outstanding) }}</b>
						<ion-badge v-if="r.utilizationPct != null" :color="r.overLimit ? 'danger' : 'success'">{{ r.utilizationPct }}%</ion-badge>
					</div>
				</ion-item>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />
			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)"><ion-infinite-scroll-content /></ion-infinite-scroll>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { InfiniteScrollCustomEvent, RefresherCustomEvent } from "@ionic/vue";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { requestAsync, usePagedList } from "@/core/modules/use-paged-list";
import { RPT70000Store } from "@/store/POS/RPT/RPT70000Store";
import ReportCards from "@/views/POS/RPT/ReportCards.vue";
import type { CreditExposureResponse, CreditExposureRow } from "@/models/POS/RPT/RPT70000";

/** Credit exposure: customers on credit, outstanding/overdue totals, utilization per customer. */
defineOptions({ name: "RPT70000" });

const { t } = useI18n();
const tr = (key: string) => t(`RPT70000.${key}`);
const store = RPT70000Store();
const money = (v: unknown) => "$ " + UT.currency(Number(v ?? 0), "USD");

const summary = ref<CreditExposureResponse | null>(null);
const paged = usePagedList<CreditExposureRow>((pageNo, pageSize) => requestAsync<CreditExposureResponse>((listener) =>
	store.api.request({ dataBody: { pageNo, pageSize, searchKeyword: store.keyword || undefined }, listener }))
	.then((p) => { summary.value = p; return { list: p.rows ?? [], totalCount: p.totalElements }; }));
const { rows, loading, hasMore } = paged;
const reload = () => void paged.reload();

const cards = computed(() => {
	const s = summary.value;
	const overdue = Number(s?.totalOverdue ?? 0);
	const overLimit = s?.overLimitCount ?? 0;
	return [
		{ label: tr("CUSTOMERS"), value: s?.customersWithCredit ?? 0 },
		{ label: tr("OUTSTANDING"), value: money(s?.totalOutstanding) },
		{ label: tr("OVERDUE"), value: money(overdue), tone: overdue > 0 ? "bad" as const : undefined },
		{ label: tr("OVER_LIMIT"), value: overLimit, tone: overLimit > 0 ? "bad" as const : undefined }
	];
});

async function onRefresh(ev: RefresherCustomEvent): Promise<void> {
	await paged.reload();
	await ev.target.complete();
}
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> {
	await paged.more();
	await ev.target.complete();
}

useViewEnter(reload);
</script>

<style scoped>
.r_code { font-size: 10px; letter-spacing: .3px; }
.r_end { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; font-size: 14px; font-variant-numeric: tabular-nums; }
.r_end small { font-size: 10px; color: #6b6b76; }
.r_bad { color: #B4231F; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
