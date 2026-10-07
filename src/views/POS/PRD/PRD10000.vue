<template>
	<ion-page>
		<bm-header title="Products" default-href="/main/menu">
			<template #end>
				<ion-button :aria-label="$t('PRD13000.PAGE_TITLE')" @click="onCustomFields">
					<ion-icon slot="icon-only" :icon="listOutline" />
				</ion-button>
				<ion-button :aria-label="tr('TAB_TRASH')" @click="router.push('/TRB10000')">
					<ion-icon slot="icon-only" :icon="trashOutline" />
				</ion-button>
				<ion-button aria-label="Export" @click="onExport">
					<ion-icon slot="icon-only" :icon="downloadOutline" />
				</ion-button>
			</template>
			<template #bottom>
				<ion-toolbar>
					<ion-searchbar v-model="store.keyword" placeholder="Search by name, SKU or barcode" :debounce="400" @ion-input="onSearch" />
				</ion-toolbar>
				<ion-toolbar class="prd_filters">
					<ion-select v-model="store.categoryId" interface="action-sheet" aria-label="Category" @ion-change="onSearch">
						<ion-select-option v-for="o in categoryOptions" :key="o.value" :value="o.value">{{ o.label }}</ion-select-option>
					</ion-select>
					<ion-select v-model="store.brandId" interface="action-sheet" aria-label="Brand" @ion-change="onSearch">
						<ion-select-option v-for="o in brandOptions" :key="o.value" :value="o.value">{{ o.label }}</ion-select-option>
					</ion-select>
				</ion-toolbar>
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)">
				<ion-refresher-content />
			</ion-refresher>
			<ion-note v-if="totalCount" class="prd_total">{{ $t("LIST.TOTAL_ITEMS", { total: totalCount }) }}</ion-note>

			<ion-list v-if="rows.length" class="scr_list">
				<ion-item-sliding v-for="p in rows" :key="p.productId">
					<ion-item button :detail="true" @click="onDetail(p)">
						<ion-thumbnail slot="start" class="prd_thumb" @click.stop="p.imageUrl ? openImage(p.imageUrl) : onDetail(p)">
							<img v-if="p.imageUrl" :src="p.imageUrl" alt="">
							<ion-icon v-else :icon="imageOutline" />
						</ion-thumbnail>
						<ion-label>
							<p class="prd_code">{{ p.productCode }}</p>
							<h2>{{ p.productName }}</h2>
							<p v-if="p.barcode">{{ p.barcode }}</p>
							<p v-if="p.categoryName">{{ p.categoryName }}</p>
						</ion-label>
						<div slot="end" class="prd_end">
							<span class="prd_price">{{ money(p.sellingPrice) }}</span>
							<ion-badge v-if="p.isActive === false" color="medium">Inactive</ion-badge>
						</div>
					</ion-item>
					<ion-item-options side="end">
						<ion-item-option @click="onEdit(p)">{{ $t("EDIT.EDIT") }}</ion-item-option>
						<ion-item-option color="danger" @click="onDelete(p)">{{ $t("DELETE.DELETE") }}</ion-item-option>
					</ion-item-options>
				</ion-item-sliding>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />

			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)">
				<ion-infinite-scroll-content />
			</ion-infinite-scroll>

			<ion-fab slot="fixed" vertical="bottom" horizontal="end">
				<ion-fab-button aria-label="New Product" @click="router.push('/PRD20000')">
					<ion-icon :icon="add" />
				</ion-fab-button>
			</ion-fab>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import type { InfiniteScrollCustomEvent, RefresherCustomEvent } from "@ionic/vue";
import { add, downloadOutline, imageOutline, listOutline, trashOutline } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import ModuleApi from "@/services/api/COMMON/module-api";
import ExportModal from "@/core/components/module/ExportModal.vue";
import { EXPORT_CONFIGS } from "@/core/modules/export-config";
import ProductFilterRefs from "@/core/modules/product-filter-refs";
import { requestAsync, usePagedList } from "@/core/modules/use-paged-list";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { BizCheckMobileSystem } from "@/shared/bizcheckmobile";
import RetrieveProductList from "@/services/api/PRD/retrieveProductList";
import { PRD10000Store } from "@/store/POS/PRD/PRD10000Store";
import type { PRD10000Response, ProductListItem } from "@/models/PRD/PRD10000";
import PRD13000 from "@/views/POS/PRD/PRD13000.vue";

/** PRD10000 — product list: search + category/brand filters, export, custom fields, row edit/delete. Import stays web-only. */
defineOptions({ name: "PRD10000" });

const { t } = useI18n();
const router = useRouter();
const tr = (key: string) => t(`PRD10000.${key}`);
const store = PRD10000Store();

const categoryOptions = ref([{ value: "ALL", label: "All Categories" }]);
const brandOptions = ref([{ value: "ALL", label: "All Brand" }]);

// Same filters as the store's loadProductList, paged for infinite scroll.
const paged = usePagedList<ProductListItem>((pageNo, pageSize) => requestAsync<PRD10000Response>((listener) =>
	RetrieveProductList.getInstance().request({
		dataBody: {
			searchKeyword: store.keyword || undefined,
			categoryId: store.categoryId === "ALL" ? undefined : store.categoryId,
			brandId: store.brandId === "ALL" ? undefined : store.brandId,
			isActive: true,
			pageNo,
			pageSize
		},
		listener
	})).then((p) => ({ list: p.productList ?? [], totalCount: p.totalCount })));
const { rows, totalCount, loading, hasMore } = paged;

const onSearch = () => void paged.reload();
async function onRefresh(ev: RefresherCustomEvent): Promise<void> {
	await paged.reload();
	await ev.target.complete();
}
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> {
	await paged.more();
	await ev.target.complete();
}

/** Category/brand filter options, cache-first from IndexedDB (WS-invalidated on edit). */
async function loadFilters(): Promise<void> {
	const [categories, brands] = await Promise.all([ProductFilterRefs.categories(), ProductFilterRefs.brands()]);
	categoryOptions.value = [{ value: "ALL", label: "All Categories" }, ...categories.map((c) => ({ value: c.categoryId, label: c.categoryName }))];
	brandOptions.value = [{ value: "ALL", label: "All Brand" }, ...brands.map((b) => ({ value: b.brandId, label: b.brandName }))];
}

const money = (v: number | undefined) => `$ ${Number(v ?? 0).toFixed(2)}`;
const openImage = (url: string) => void BizCheckMobileSystem.callBrowser({ url });

function onDetail(p: ProductListItem): void {
	router.push(`/PRD50000?productCode=${p.productCode}`);
}
function onEdit(p: ProductListItem): void {
	router.push({ path: "/PRD14000", query: { productId: p.productId, productCode: p.productCode } });
}
function onDelete(p: ProductListItem): void {
	POP.confirm({
		title: t("DELETE.DELETE"),
		content: t("DELETE.CONFIRM", { name: p.productName }),
		okBtn: {
			btnText: t("DELETE.DELETE"),
			onClick: () => ModuleApi.request("PRD10000I02", { productId: p.productId }, {
				onSuccess: onSearch,
				onFail: (e) => POP.apiError(e, t("DELETE.FAILED"))
			})
		}
	});
}
function onCustomFields(): void {
	POP.showPopup(PRD13000, { title: t("PRD13000.PAGE_TITLE") }).promise.catch(() => undefined);
}
function onExport(): void {
	POP.showPopup(ExportModal, { title: "Export Products", props: { config: EXPORT_CONFIGS.PRD } }).promise.catch(() => undefined);
}

onMounted(loadFilters);
// Reload on every visit so products created/edited elsewhere show up.
useViewEnter(onSearch);
</script>

<style scoped>
.prd_filters ion-select { display: inline-block; width: calc(50% - 12px); margin: 0 4px; font-size: 14px; }
.prd_total { display: block; padding: 8px 16px 0; font-size: 12px; }
.prd_thumb { --size: 48px; --border-radius: 8px; display: flex; align-items: center; justify-content: center; background: #f2f2f5; }
.prd_thumb img { object-fit: cover; }
.prd_thumb ion-icon { font-size: 16px; color: #cfd0d8; }
.prd_code { font-size: 10px; letter-spacing: .3px; }
.prd_end { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.prd_price { font-size: 14px; font-weight: 600; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
