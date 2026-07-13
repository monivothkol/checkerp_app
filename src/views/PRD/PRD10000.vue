<template>
	<ion-page>
		<bm-header title="Product" :back-button="false">
			<template #btnEnd>
				<ion-button fill="clear" class="head_icon_btn" @click="onToggleSearch">
					<ion-icon slot="icon-only" :icon="searchOutline" />
				</ion-button>
				<ion-button fill="clear" class="head_icon_btn" @click="onCreate">
					<ion-icon slot="icon-only" :icon="addOutline" />
				</ion-button>
			</template>
		</bm-header>

		<bm-content :infinite="hasMore" @onInfinite="loadMore">
			<div class="wrap_content">
				<!-- Search + Filter + Scan row -->
				<div class="filter_row">
					<div class="search_field">
						<ion-icon :icon="searchOutline" class="search_icon" />
						<input
							v-model="keyword"
							class="search_input"
							placeholder="Input value"
							@keyup.enter="onSearch" />
						<ion-icon v-if="keyword" :icon="closeCircle" class="clear_icon" @click="onClearKeyword" />
					</div>
					<button class="tool_btn" @click="onFilter">
						<ion-icon :icon="funnelOutline" />
						<span>Filter</span>
					</button>
					<button class="tool_btn" @click="onScan">
						<ion-icon :icon="qrCodeOutline" />
						<span>Scan</span>
					</button>
				</div>

				<!-- Product grid -->
				<div v-if="productList.length" class="product_grid">
					<div
						v-for="item in productList"
						:key="item.productId"
						class="product_card"
						@click="onClickProduct(item)">
						<div class="product_thumb">
							<img v-if="item.imageUrl" :src="item.imageUrl" alt="" class="thumb_img" />
							<ion-icon v-else :icon="imageOutline" class="thumb_placeholder" />
						</div>
						<p class="product_name">{{ item.productName }}</p>
						<p class="product_code">{{ item.productCode }}</p>
						<div class="product_price_row">
							<span class="product_price">{{ money(item.sellingPrice) }}</span>
							<span
								v-if="item.minSellingPrice && item.minSellingPrice > (item.sellingPrice ?? 0)"
								class="product_price_old">{{ money(item.minSellingPrice) }}</span>
						</div>
					</div>
				</div>

				<bm-empty-state v-else-if="loaded" title="No products" message="Tap + to create your first product." />
			</div>
		</bm-content>
	</ion-page>
</template>

<script setup lang="ts">
/**
 * ---------------------------------------------------------
 *
 * Component: PRD10000
 * Description: Product List
 *
 * ---------------------------------------------------------
 * */
import { PRD10000Item } from "@/interfaces/PRD/PRD10000";
import ProductModule from "@/modules/prd-module";
import RouterServices from "@/services/router-services";
import DialogUtil from "@/utilities/dialog-util";
import { onIonViewWillEnter } from "@ionic/vue";
import {
	addOutline, closeCircle, funnelOutline, imageOutline, qrCodeOutline, searchOutline
} from "ionicons/icons";
import { ref } from "vue";

defineOptions({
	name: "PRD10000",
	description: "Product List"
});

const productModule = ProductModule.getInstance();
const routerService = new RouterServices();

const keyword = ref<string>("");
const productList = ref<PRD10000Item[]>([]);
const loaded = ref<boolean>(false);
const pageNo = ref<number>(1);
const pageSize = 20;
const totalCount = ref<number>(0);
const hasMore = ref<boolean>(false);

const money = (value: number | undefined) => `$ ${Number(value ?? 0).toFixed(2)}`;

const loadProductList = (append = false) => {
	productModule.fetchProductList({
		body: {
			searchKeyword: keyword.value || undefined,
			pageNo: pageNo.value,
			pageSize
		},
		enableLoading: !append,
		onSuccess: (response) => {
			const rows = response.productList ?? [];
			totalCount.value = response.totalCount ?? 0;
			productList.value = append ? [...productList.value, ...rows] : rows;
			hasMore.value = productList.value.length < totalCount.value;
			loaded.value = true;
		},
		onFailed: () => {
			loaded.value = true;
		}
	});
};

const onSearch = () => {
	pageNo.value = 1;
	loadProductList();
};

const onClearKeyword = () => {
	keyword.value = "";
	onSearch();
};

const onToggleSearch = () => {
	DialogUtil.showToast({ message: "Type in the search box below" });
};

const loadMore = (ev: CustomEvent) => {
	if (hasMore.value) {
		pageNo.value += 1;
		loadProductList(true);
	}
	(ev.target as HTMLIonInfiniteScrollElement)?.complete();
};

const onCreate = () => routerService.push("/PRD20000");
const onClickProduct = (item: PRD10000Item) => routerService.push(`/PRD50000?productCode=${item.productCode}`);
const onFilter = () => DialogUtil.showToast({ message: "Filter is coming soon" });
const onScan = () => DialogUtil.showToast({ message: "Scan is coming soon" });

onIonViewWillEnter(() => {
	pageNo.value = 1;
	loadProductList();
});
</script>

<style scoped lang="scss">
.head_icon_btn { --color: #1a1a1a; font-size: 22px; }

.filter_row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.search_field {
	flex: 1; display: flex; align-items: center; gap: 8px;
	border: 1px solid #e0e0e0; border-radius: 12px; padding: 0 12px; height: 44px; background: #ffffff;
}
.search_icon { font-size: 18px; color: #9e9e9e; }
.clear_icon { font-size: 18px; color: #9e9e9e; }
.search_input { flex: 1; border: none; outline: none; font-size: 14px; background: transparent; }
.tool_btn {
	display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
	width: 56px; height: 56px; border: 1px solid #e0e0e0; border-radius: 12px; background: #ffffff;
	font-size: 11px; color: #333333; cursor: pointer;
	ion-icon { font-size: 18px; }
}

.product_grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.product_card {
	border: 1px solid #eeeeee; border-radius: 12px; padding: 8px; background: #ffffff; cursor: pointer;
}
.product_thumb {
	display: flex; align-items: center; justify-content: center;
	aspect-ratio: 1 / 1; border-radius: 8px; background: #fafafa; overflow: hidden; margin-bottom: 8px;
}
.thumb_img { width: 100%; height: 100%; object-fit: cover; }
.thumb_placeholder { font-size: 40px; color: #cccccc; }
.product_name { font-size: 14px; font-weight: 500; color: #1a1a1a; margin: 0 0 2px; }
.product_code { font-size: 12px; color: #8a8a8a; margin: 0 0 6px; }
.product_price_row { display: flex; align-items: baseline; gap: 8px; }
.product_price { font-size: 16px; font-weight: 700; color: #6a1b9a; }
.product_price_old { font-size: 13px; color: #d32f2f; text-decoration: line-through; }
</style>
