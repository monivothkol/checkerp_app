<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #end>
				<ion-button @click="onExport"><ion-icon slot="icon-only" :icon="downloadOutline" /></ion-button>
			</template>
			<template #bottom>
				<ion-toolbar>
					<ion-searchbar v-model="store.keyword" :placeholder="tr('SEARCH_PLACEHOLDER')" :debounce="300" @ion-input="reload" />
				</ion-toolbar>
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-note v-if="totalCount" class="c30_total">{{ $t("LIST.TOTAL_ITEMS", { total: totalCount }) }}</ion-note>
			<ion-list v-if="rows.length" class="scr_list">
				<ion-item-sliding v-for="r in rows" :key="r.conditionId">
					<ion-item button :detail="true" @click="openDetail(r.conditionId)">
						<ion-label>
							<p class="c30_type">{{ tr("TYPE_" + r.conditionType) }}</p>
							<h2>{{ r.conditionName }}</h2>
							<p>{{ tr("COL_CONDITION") }}: {{ conditionSummary(r.conditionType, r.conditionValue) }}</p>
							<p>{{ tr("COL_POINTS") }}: {{ Number(r.pointReward ?? 0) }}</p>
						</ion-label>
						<ion-badge slot="end" :color="r.isActive ? 'success' : 'medium'">{{ r.isActive ? tr("ACTIVE") : tr("INACTIVE") }}</ion-badge>
					</ion-item>
					<ion-item-options side="end">
						<ion-item-option @click="openEdit(r)">{{ $t("EDIT.EDIT") }}</ion-item-option>
						<ion-item-option color="danger" @click="openDelete(r)">{{ $t("DELETE.DELETE") }}</ion-item-option>
					</ion-item-options>
				</ion-item-sliding>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />
			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)"><ion-infinite-scroll-content /></ion-infinite-scroll>
			<ion-fab slot="fixed" vertical="bottom" horizontal="end">
				<ion-fab-button @click="router.push('/CUS31000')"><ion-icon :icon="add" /></ion-fab-button>
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
import { conditionSummary } from "@/core/modules/loyalty-condition";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { requestAsync, usePagedList } from "@/core/modules/use-paged-list";
import { CUS30000Store } from "@/store/POS/CUS/CUS30000Store";
import LoyaltyEditModal from "@/views/POS/CUS/LoyaltyEditModal.vue";
import type { CUS30000Response, LoyaltyConditionRow } from "@/models/POS/CUS/CUS30000";

/** Loyalty point conditions: search, view, edit (name/points/active), hard delete, export. */
defineOptions({ name: "CUS30000" });

const { t } = useI18n();
const router = useRouter();
const tr = (key: string) => t(`CUS30000.${key}`);
const store = CUS30000Store();

const paged = usePagedList<LoyaltyConditionRow>((pageNo, pageSize) => requestAsync<CUS30000Response>((listener) =>
	store.listApi.request({ dataBody: { searchKeyword: store.keyword, pageNo, pageSize }, listener }))
	.then((p) => ({ list: p.conditionList ?? [], totalCount: p.totalCount })));
const { rows, totalCount, loading, hasMore } = paged;
const reload = () => void paged.reload();

async function onRefresh(ev: RefresherCustomEvent): Promise<void> {
	await paged.reload();
	await ev.target.complete();
}
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> {
	await paged.more();
	await ev.target.complete();
}

function onExport(): void {
	const cfg = EXPORT_CONFIGS.LOY;
	POP.showPopup(ExportModal, { title: t(`${cfg.trKey}.PAGE_TITLE`), props: { config: cfg } }).promise.catch(() => undefined);
}
function openDetail(conditionId: string): void {
	router.push(`/CUS34000?conditionId=${encodeURIComponent(conditionId)}`);
}
function openEdit(record: LoyaltyConditionRow): void {
	POP.showPopup(LoyaltyEditModal, { title: `${t("EDIT.EDIT")} — ${tr("PAGE_TITLE")}`, props: { record } })
		.promise.then(reload).catch(() => undefined);
}
/** Hard delete (v1 parity for point conditions) behind a confirm. */
function openDelete(record: LoyaltyConditionRow): void {
	POP.confirm({
		title: t("DELETE.DELETE"),
		content: t("DELETE.CONFIRM", { name: record.conditionName }),
		okBtn: {
			btnText: t("DELETE.DELETE"),
			onClick: () => store.deleteApi.request({
				dataBody: { conditionId: record.conditionId },
				listener: { onSuccess: reload, onFail: (e) => POP.apiError(e, t("DELETE.FAILED")) }
			})
		}
	});
}

useViewEnter(reload);
</script>

<style scoped>
.c30_total { display: block; padding: 8px 16px 0; font-size: 12px; }
.c30_type { font-size: 10px; letter-spacing: .3px; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
