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
			<ion-note v-if="totalCount" class="sfm_total">{{ $t("LIST.TOTAL_ITEMS", { total: totalCount }) }}</ion-note>
			<ion-list v-if="rows.length" class="scr_list">
				<ion-item v-for="r in rows" :key="r.staffId" button :detail="true" @click="router.push(`/SFM20000?staffId=${encodeURIComponent(r.staffId)}`)">
					<ion-label>
						<p class="sfm_code">{{ r.staffCode }}</p>
						<h2>{{ r.staffName }}</h2>
						<p>{{ tr("COL_LOAN") }}: {{ money(r.loanBalance) }} · {{ tr("COL_ADVANCE") }}: {{ money(r.advanceBalance) }}</p>
						<p>{{ tr("COL_DEPOSIT") }}: {{ money(r.depositBalance) }}</p>
					</ion-label>
				</ion-item>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />
			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)"><ion-infinite-scroll-content /></ion-infinite-scroll>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import type { InfiniteScrollCustomEvent, RefresherCustomEvent } from "@ionic/vue";
import { downloadOutline } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import UT from "@/core/utilities/ut";
import ExportModal from "@/core/components/module/ExportModal.vue";
import { EXPORT_CONFIGS } from "@/core/modules/export-config";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { requestAsync, usePagedList } from "@/core/modules/use-paged-list";
import { SFM10000Store } from "@/store/POS/SFM/SFM10000Store";
import type { StaffFinancialRow, SFM10000Response } from "@/models/POS/SFM/SFM10000";

/** Staff financial accounts: loan / advance / deposit balances per staff. */
defineOptions({ name: "SFM10000" });

const { t } = useI18n();
const router = useRouter();
const tr = (k: string) => t(`SFM10000.${k}`);
const store = SFM10000Store();

const paged = usePagedList<StaffFinancialRow>((pageNo, pageSize) => requestAsync<SFM10000Response>((listener) =>
	store.api.request({ dataBody: { searchKeyword: store.keyword || undefined, pageNo, pageSize }, listener }))
	.then((p) => ({ list: p.accountList ?? [], totalCount: p.totalCount })));
const { rows, totalCount, loading, hasMore } = paged;

const onSearch = () => void paged.reload();
async function onRefresh(ev: RefresherCustomEvent): Promise<void> { await paged.reload(); await ev.target.complete(); }
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> { await paged.more(); await ev.target.complete(); }

const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");
function onExport(): void {
	const cfg = EXPORT_CONFIGS.SFM;
	POP.showPopup(ExportModal, { title: t(`${cfg.trKey}.PAGE_TITLE`), props: { config: cfg } }).promise.catch(() => undefined);
}

useViewEnter(onSearch);
</script>

<style scoped>
.sfm_total { display: block; padding: 8px 16px 0; font-size: 12px; }
.sfm_code { font-size: 12px; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; font-variant-numeric: tabular-nums; }
</style>
