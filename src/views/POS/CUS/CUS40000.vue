<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #end>
				<ion-button :disabled="store.exporting" @click="onExport"><ion-icon slot="icon-only" :icon="downloadOutline" /></ion-button>
			</template>
			<template #bottom>
				<ion-toolbar>
					<ion-searchbar v-model="store.keyword" :placeholder="tr('SEARCH')" :debounce="300" @ion-input="reload" />
				</ion-toolbar>
				<ion-toolbar>
					<ion-select v-model="store.groupId" class="c40_group" :placeholder="tr('ALL_GROUPS')" interface="action-sheet" @ion-change="reload">
						<ion-select-option :value="undefined">{{ tr("ALL_GROUPS") }}</ion-select-option>
						<ion-select-option v-for="g in store.groups" :key="g.groupId" :value="g.groupId">{{ g.groupName }} ({{ g.groupCode }})</ion-select-option>
					</ion-select>
				</ion-toolbar>
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-note v-if="totalCount" class="c40_total">{{ $t("LIST.TOTAL_ITEMS", { total: totalCount }) }}</ion-note>
			<ion-list v-if="rows.length" class="scr_list" lines="full">
				<ion-item v-for="r in rows" :key="r.priceId">
					<ion-label>
						<p class="c40_code">{{ r.productCode }} · {{ r.variantCode || tr("ALL_VARIANTS") }}</p>
						<h2>{{ r.productName }}</h2>
						<p>{{ tr("COL_GROUP") }}: {{ r.groupName }}</p>
						<p>{{ tr("COL_STANDARD") }}: {{ UT.currency(r.originalPrice ?? 0, "USD") }}</p>
					</ion-label>
					<div slot="end" class="c40_end">
						<b>{{ money(r.groupPrice) }}</b>
						<span :class="diffClass(r)">{{ diffText(r) }}</span>
					</div>
				</ion-item>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />
			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)"><ion-infinite-scroll-content /></ion-infinite-scroll>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import type { InfiniteScrollCustomEvent, RefresherCustomEvent } from "@ionic/vue";
import { downloadOutline } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import UT from "@/core/utilities/ut";
import { BizCheckMobileSystem } from "@/shared/bizcheckmobile";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { requestAsync, usePagedList } from "@/core/modules/use-paged-list";
import ExportPriceGroup from "@/services/api/PMM/exportPriceGroup";
import { CUS40000Store } from "@/store/POS/CUS/CUS40000Store";
import type { CUS40000Response, PriceGroupRow } from "@/models/POS/CUS/CUS40000";

/** Customer-group price overrides: group + keyword filters, % diff vs standard price, export. Import is web-only. */
defineOptions({ name: "CUS40000" });

type Row = PriceGroupRow & { variantCode?: string };

const { t } = useI18n();
const tr = (key: string) => t(`CUS40000.${key}`);
const store = CUS40000Store();
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");

const paged = usePagedList<Row>((pageNo, pageSize) => requestAsync<CUS40000Response>((listener) =>
	store.priceApi.request({ dataBody: { groupId: store.groupId || undefined, searchKeyword: store.keyword || undefined, pageNo, pageSize }, listener }))
	.then((p) => ({ list: p.priceList ?? [], totalCount: p.totalCount })));
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

function diffText(r: Row): string {
	const std = Number(r.originalPrice ?? 0);
	const grp = Number(r.groupPrice ?? 0);
	if (!std) return "—";
	const pct = ((grp - std) / std) * 100;
	return `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`;
}
function diffClass(r: Row): string {
	const diff = Number(r.groupPrice ?? 0) - Number(r.originalPrice ?? 0);
	return diff < 0 ? "c40_down" : diff > 0 ? "c40_up" : "";
}

function onExport(): void {
	store.exporting = true;
	ExportPriceGroup.getInstance().request({
		dataBody: { groupId: store.groupId || undefined, searchKeyword: store.keyword || undefined },
		listener: {
			onSuccess: (p) => {
				store.exporting = false;
				// R2 presigned URL (Content-Disposition: attachment saves the file).
				if (p.url) void BizCheckMobileSystem.callBrowser({ url: p.url });
			},
			onFail: (e) => {
				store.exporting = false;
				POP.apiError(e, t("EXPORT.EXPORT"));
			}
		}
	});
}

onMounted(() => store.loadGroups());
useViewEnter(reload);
</script>

<style scoped>
.c40_total { display: block; padding: 8px 16px 0; font-size: 12px; }
.c40_code { font-size: 10px; letter-spacing: .3px; }
.c40_group { padding: 0 16px; }
.c40_end { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; font-size: 14px; }
.c40_end span { font-size: 12px; font-weight: 600; }
.c40_down { color: #1B9B54; }
.c40_up { color: #C33; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
