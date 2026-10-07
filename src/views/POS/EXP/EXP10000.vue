<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #end>
				<ion-button @click="onExport"><ion-icon slot="icon-only" :icon="downloadOutline" /></ion-button>
			</template>
			<template #bottom>
				<ion-toolbar>
					<ion-searchbar v-model="store.keyword" :placeholder="tr('SEARCH')" :debounce="300" @ion-input="reload" />
				</ion-toolbar>
				<ion-toolbar class="e10_filters">
					<ion-select v-model="store.categoryId" :placeholder="tr('ALL_CATEGORIES')" interface="action-sheet" @ion-change="reload">
						<ion-select-option :value="undefined">{{ tr("ALL_CATEGORIES") }}</ion-select-option>
						<ion-select-option v-for="c in store.categories" :key="c.categoryId" :value="c.categoryId">{{ c.name }}</ion-select-option>
					</ion-select>
					<div class="e10_range">
						<ion-input v-model="from" type="date" :aria-label="`${tr('COL_DATE')} ▸`" @ion-change="reload" />
						<ion-input v-model="to" type="date" :aria-label="`${tr('COL_DATE')} ◂`" @ion-change="reload" />
					</div>
				</ion-toolbar>
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-note v-if="totalCount" class="e10_total">{{ $t("LIST.TOTAL_ITEMS", { total: totalCount }) }}</ion-note>
			<ion-list v-if="rows.length" class="scr_list">
				<ion-item-sliding v-for="r in rows" :key="r.expenseId">
					<ion-item button :detail="true" @click="onDetail(r)">
						<ion-label>
							<p class="e10_code">{{ r.code }} · {{ r.expenseDate }}</p>
							<h2>{{ r.listName ?? "—" }}</h2>
							<p>{{ tr("COL_CATEGORY") }}: {{ r.categoryName ?? "—" }}</p>
							<p v-if="r.description">{{ r.description }}</p>
						</ion-label>
						<b slot="end" class="e10_amount">{{ money(r.amount, r.currency) }}</b>
					</ion-item>
					<ion-item-options side="end">
						<ion-item-option @click="onEdit(r)">{{ $t("EDIT.EDIT") }}</ion-item-option>
						<ion-item-option color="danger" @click="onDelete(r)">{{ $t("DELETE.DELETE") }}</ion-item-option>
					</ion-item-options>
				</ion-item-sliding>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />
			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)"><ion-infinite-scroll-content /></ion-infinite-scroll>
			<ion-fab slot="fixed" vertical="bottom" horizontal="end">
				<ion-fab-button @click="router.push('/EXP11000')"><ion-icon :icon="add" /></ion-fab-button>
			</ion-fab>
		</ion-content>
		<ion-footer v-if="rows.length">
			<ion-toolbar class="e10_sum">
				<span>{{ tr("PAGE_TOTAL") }}</span>
				<b slot="end">{{ money(pageTotal, "USD") }}</b>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
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
import { EXP10000Store } from "@/store/POS/EXP/EXP10000Store";
import type { EXP10000Response, ExpenseRow } from "@/models/POS/EXP/EXP10000";

/** Expense records: keyword/category/date filters, running total, edit/delete, export (EXP14000). */
defineOptions({ name: "EXP10000" });

const { t } = useI18n();
const router = useRouter();
const tr = (key: string) => t(`EXP10000.${key}`);
const store = EXP10000Store();

const money = (v: unknown, currency = "USD") => (currency === "KHR" ? "៛ " : "$ ") + UT.currency((v as string | number) ?? 0, currency);
const from = computed({ get: () => store.dateRange[0] ?? "", set: (v: string) => { store.dateRange = [v, store.dateRange[1] ?? ""]; } });
const to = computed({ get: () => store.dateRange[1] ?? "", set: (v: string) => { store.dateRange = [store.dateRange[0] ?? "", v]; } });

const paged = usePagedList<ExpenseRow>((pageNo, pageSize) => requestAsync<EXP10000Response>((listener) =>
	store.listApi.request({
		dataBody: {
			searchKeyword: store.keyword || undefined,
			categoryId: store.categoryId || undefined,
			startDate: store.dateRange[0] || undefined,
			endDate: store.dateRange[1] || undefined,
			pageNo,
			pageSize
		},
		listener
	}))
	// Legacy v1 rows can carry a null currency.
	.then((p) => ({ list: (p.expenseList ?? []).map((r) => ({ ...r, currency: r.currency || "USD" })), totalCount: p.totalCount })));
const { rows, totalCount, loading, hasMore } = paged;
const reload = () => void paged.reload();
// Web sums the visible page; on a phone the visible set is everything scrolled in so far.
const pageTotal = computed(() => rows.value.reduce((sum, r) => sum + Number(r.amount ?? 0), 0));

async function onRefresh(ev: RefresherCustomEvent): Promise<void> {
	await paged.reload();
	await ev.target.complete();
}
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> {
	await paged.more();
	await ev.target.complete();
}

function onExport(): void {
	POP.showPopup(ExportModal, { title: t("EXP14000.PAGE_TITLE"), props: { config: EXPORT_CONFIGS.EXPR } }).promise.catch(() => undefined);
}
function onDetail(r: ExpenseRow): void {
	router.push(`/EXP15000?expenseId=${encodeURIComponent(r.expenseId)}`);
}
function onEdit(r: ExpenseRow): void {
	router.push(`/EXP11000?expenseId=${encodeURIComponent(r.expenseId)}`);
}
function onDelete(r: ExpenseRow): void {
	POP.confirm({
		title: t("DELETE.DELETE"),
		content: t("DELETE.CONFIRM", { name: r.code }),
		okBtn: {
			btnText: t("DELETE.DELETE"),
			onClick: () => store.deleteApi.request({
				dataBody: { expenseId: r.expenseId },
				listener: { onSuccess: reload, onFail: (e) => POP.apiError(e, t("DELETE.FAILED")) }
			})
		}
	});
}

onMounted(() => store.loadCategories());
useViewEnter(reload);
</script>

<style scoped>
.e10_total { display: block; padding: 8px 16px 0; font-size: 12px; }
.e10_code { font-size: 10px; letter-spacing: .3px; }
.e10_filters ion-select { padding: 0 16px; }
.e10_range { display: flex; gap: 8px; padding: 0 16px; }
.e10_range ion-input { font-size: 12px; }
.e10_amount { font-size: 14px; font-variant-numeric: tabular-nums; }
.e10_sum { --padding-start: 16px; --padding-end: 16px; font-size: 14px; }
.e10_sum b { font-variant-numeric: tabular-nums; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
