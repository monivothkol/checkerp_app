<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #bottom>
				<ion-toolbar>
					<ion-searchbar v-model="keyword" :placeholder="tr('SEARCH_PLACEHOLDER')" :debounce="300" @ion-input="reload" />
				</ion-toolbar>
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)">
				<ion-refresher-content />
			</ion-refresher>
			<ion-note v-if="totalCount" class="trb_total">{{ $t("LIST.TOTAL_ITEMS", { total: totalCount }) }}</ion-note>

			<ion-list v-if="rows.length" class="scr_list">
				<ion-item v-for="r in rows" :key="r.productId">
					<ion-label>
						<p class="trb_code">{{ r.productCode }}</p>
						<h2>{{ r.productName ?? "—" }}</h2>
						<p>{{ tr("COL_CATEGORY") }}: {{ r.categoryName ?? "—" }}</p>
						<p>{{ tr("COL_PRICE") }}: {{ r.sellingPrice == null ? "—" : UT.currency(r.sellingPrice, "USD") }}</p>
					</ion-label>
					<ion-button slot="end" fill="outline" size="small" @click="onRestore(r)">
						<ion-icon slot="start" :icon="arrowUndoOutline" />{{ tr("RESTORE") }}
					</ion-button>
				</ion-item>
			</ion-list>
			<bm-empty-state v-else-if="!loading" :description="'TRB10000.EMPTY'" />

			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)">
				<ion-infinite-scroll-content />
			</ion-infinite-scroll>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import type { InfiniteScrollCustomEvent, RefresherCustomEvent } from "@ionic/vue";
import { arrowUndoOutline } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import UT from "@/core/utilities/ut";
import { requestAsync, usePagedList } from "@/core/modules/use-paged-list";
import { useViewEnter } from "@/core/modules/use-view-enter";
import RetrieveProductList from "@/services/api/PRD/retrieveProductList";
import RestoreProduct from "@/services/api/PRD/restoreProduct";
import type { PRD10000Response, ProductListItem } from "@/models/PRD/PRD10000";

/** TRB10000 — trash bin: deactivated products, each restorable. */
defineOptions({ name: "TRB10000" });

const { t } = useI18n();
const tr = (k: string) => t(`TRB10000.${k}`);
const keyword = ref("");

const paged = usePagedList<ProductListItem>((pageNo, pageSize) => requestAsync<PRD10000Response>((listener) =>
	RetrieveProductList.getInstance().request({
		dataBody: { searchKeyword: keyword.value || undefined, isActive: false, pageNo, pageSize }, // trash = inactive only
		enableLoading: false,
		listener
	})).then((p) => ({ list: p.productList ?? [], totalCount: p.totalCount ?? 0 })));
const { rows, totalCount, loading, hasMore } = paged;
const reload = () => void paged.reload();

async function onRefresh(ev: RefresherCustomEvent): Promise<void> { await paged.reload(); await ev.target.complete(); }
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> { await paged.more(); await ev.target.complete(); }

function onRestore(r: ProductListItem): void {
	if (!r.productId) return;
	RestoreProduct.getInstance().request({
		dataBody: { productId: r.productId },
		listener: {
			onSuccess: reload,
			onFail: (e) => POP.apiError(e, tr("RESTORE_FAILED"))
		}
	});
}

useViewEnter(reload);
</script>

<style scoped>
.trb_total { display: block; padding: 8px 16px 0; font-size: 12px; }
.trb_code { font-size: 10px; letter-spacing: .3px; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
