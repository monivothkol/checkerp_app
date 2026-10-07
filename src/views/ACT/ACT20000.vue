<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #bottom>
				<ion-toolbar>
					<ion-searchbar v-model="store.keyword" :placeholder="tr('SEARCH_PLACEHOLDER')" :debounce="300" @ion-input="reload" />
				</ion-toolbar>
				<ion-toolbar>
					<div class="jl_filters">
						<ion-select :value="store.sourceType ?? ''" interface="action-sheet" @ion-change="store.sourceType = $event.detail.value || undefined; reload()">
							<ion-select-option value="">{{ tr("ALL_SOURCES") }}</ion-select-option>
							<ion-select-option v-for="s in SOURCES" :key="s" :value="s">{{ s }}</ion-select-option>
						</ion-select>
						<ion-select :value="store.status ?? ''" interface="action-sheet" @ion-change="store.status = $event.detail.value || undefined; reload()">
							<ion-select-option value="">{{ tr("ALL_STATUSES") }}</ion-select-option>
							<ion-select-option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</ion-select-option>
						</ion-select>
					</div>
				</ion-toolbar>
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-list class="scr_list" lines="full">
				<ActDateRange v-model="store.dateRange" @change="reload" />
			</ion-list>
			<ion-note v-if="totalCount" class="act_hint">{{ $t("LIST.TOTAL_ITEMS", { total: totalCount }) }}</ion-note>

			<ion-list v-if="rows.length" class="scr_list" lines="full">
				<ion-item-sliding v-for="r in rows" :key="r.journalNo">
					<ion-item button :detail="false" @click="openDetail(r.journalNo)">
						<ion-label>
							<p>{{ r.journalNo }} · {{ r.entryDate }}</p>
							<h3 class="jl_desc">{{ r.description }}</h3>
							<p>
								<ion-badge :color="sourceColor(r.sourceType)">{{ r.sourceType }}</ion-badge>
								<ion-badge :color="r.journalStatusCode === 'POSTED' ? 'success' : 'warning'">{{ r.journalStatusCode }}</ion-badge>
							</p>
						</ion-label>
						<div slot="end" class="jl_amt">
							<small>{{ tr("DEBIT") }} {{ money(r.totalDebit) }}</small>
							<small>{{ tr("CREDIT") }} {{ money(r.totalCredit) }}</small>
						</div>
					</ion-item>
					<ion-item-options v-if="r.journalStatusCode === 'POSTED'" side="end">
						<ion-item-option color="danger" @click="confirmReverse(r.journalNo)">{{ tr("REVERSE") }}</ion-item-option>
					</ion-item-options>
				</ion-item-sliding>
			</ion-list>
			<bm-empty-state v-else-if="!loading" description="ACT20000.EMPTY" />

			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)"><ion-infinite-scroll-content /></ion-infinite-scroll>
			<ion-fab slot="fixed" vertical="bottom" horizontal="end">
				<ion-fab-button @click="router.push('/ACT20200')"><ion-icon :icon="add" /></ion-fab-button>
			</ion-fab>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { type InfiniteScrollCustomEvent, type RefresherCustomEvent } from "@ionic/vue";
import { add } from "ionicons/icons";
import UT from "@/core/utilities/ut";
import POP from "@/core/utilities/pop";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { requestAsync, usePagedList } from "@/core/modules/use-paged-list";
import RetrieveJournalList from "@/services/api/ACT/retrieveJournalList";
import { ACT20000Store } from "@/store/ACT/ACT20000Store";
import type { ActJournalRow } from "@/models/ACT/ACT40000";
import JournalDetailModal from "@/views/ACT/ACT20100.vue";
import ActDateRange from "@/views/ACT/ActDateRange.vue";

/** Journal list: search + source/status/date filters, tap = detail sheet, swipe a POSTED journal to reverse it. */
defineOptions({ name: "ACT20000" });

const SOURCE_COLORS: Record<string, string> = {
	SALE: "primary", PAYMENT: "success", PURCHASE: "tertiary", PURCHASE_PAYMENT: "secondary",
	EXPENSE: "danger", MANUAL: "medium", REVERSAL: "warning", OPENING_BALANCE: "secondary"
};
const SOURCES = Object.keys(SOURCE_COLORS);
const STATUSES = ["POSTED", "REVERSED"];

const { t } = useI18n();
const tr = (k: string) => t(`ACT20000.${k}`);
const router = useRouter();
const store = ACT20000Store();
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");
const sourceColor = (s: string) => SOURCE_COLORS[s] ?? "medium";

// Same request body as the store's load(); paging is the app's infinite scroll.
const paged = usePagedList<ActJournalRow>((pageNo, pageSize) => requestAsync<{ journalList?: ActJournalRow[]; totalCount?: number }>((listener) =>
	RetrieveJournalList.getInstance().request({
		dataBody: {
			searchKeyword: store.keyword,
			sourceType: store.sourceType ?? "",
			journalStatusCode: store.status ?? "",
			fromDate: store.dateRange?.[0] ?? "",
			toDate: store.dateRange?.[1] ?? "",
			pageNo,
			pageSize
		},
		listener
	})).then((p) => ({ list: p.journalList ?? [], totalCount: p.totalCount })));
const { rows, totalCount, loading, hasMore } = paged;
const reload = () => void paged.reload();

useViewEnter(reload);
// store.reverse() refreshes store.rows on success — that is the signal to refresh this list too.
watch(() => store.rows, reload);

async function onRefresh(ev: RefresherCustomEvent): Promise<void> {
	await paged.reload();
	await ev.target.complete();
}
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> {
	await paged.more();
	await ev.target.complete();
}
function openDetail(journalNo: string): void {
	POP.showPopup(JournalDetailModal, { title: journalNo, props: { journalNo } }).promise.catch(() => undefined);
}
/** Optional reason prompt, then the store's reverse (same as the web). */
function confirmReverse(journalNo: string): void {
	POP.input({ title: `${tr("REVERSE_TITLE")} ${journalNo}`, subtitle: tr("REVERSE_REASON") })
		.then((res) => store.reverse(journalNo, String(res?.data ?? ""), { reversedAs: tr("REVERSED_AS"), failed: tr("REVERSE_FAILED") }))
		.catch(() => undefined);
}
</script>

<style scoped src="./act-report.css"></style>
<style scoped>
.jl_filters { display: flex; gap: 8px; padding: 0 16px; }
.jl_filters ion-select { flex: 1; font-size: 14px; }
.jl_desc { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.jl_amt { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; font-variant-numeric: tabular-nums;
	small { font-size: 12px; }
}
ion-label ion-badge { margin-right: 4px; font-size: 10px; }
</style>
