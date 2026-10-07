<template>
	<ion-page>
		<bm-header :title="store.product && !store.loading ? store.product.productName : $t('PRD50000.PAGE_TITLE')" default-href="/PRD10000">
			<template v-if="store.product && !store.loading" #bottom>
				<ion-toolbar>
					<ion-segment v-model="activeTab" scrollable>
						<ion-segment-button v-for="tab in TABS" :key="tab.key" :value="tab.key"><ion-label>{{ $t("PRD50000." + tab.label) }}</ion-label></ion-segment-button>
					</ion-segment>
				</ion-toolbar>
			</template>
		</bm-header>

		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<template v-else-if="store.product">
				<!-- Detail tab -->
				<template v-if="activeTab === 'detail'">
					<p v-if="code" class="pd_code">{{ code }}</p>
					<div v-if="imageList.length" class="pd_gallery">
						<img v-for="(url, i) in imageList" :key="i" :src="url" alt="" @click="openUrl(url)">
					</div>
					<div class="pd_price_head">
						<div>
							<p class="pd_price_label">{{ $t("PRD50000.SELLING_PRICE") }}</p>
							<p class="pd_price_val">{{ money(store.product.sellingPrice) }}</p>
						</div>
						<ion-badge :color="store.product.isActive ? 'success' : 'medium'">
							{{ store.product.isActive ? $t("PRD50000.ACTIVE") : $t("PRD50000.INACTIVE") }}
						</ion-badge>
					</div>
					<ion-list class="scr_list" lines="full">
						<ion-item v-for="row in detailRows" :key="row.label">
							<ion-label>
								<p>{{ row.label }}</p>
								<h3 class="pd_value">{{ row.value }}</h3>
							</ion-label>
						</ion-item>
						<ion-item>
							<ion-label>
								<p>{{ $t("PRD50000.TRACK_INVENTORY") }}</p>
								<ion-badge :color="store.product.isTrackInventory ? 'success' : 'medium'">
									{{ store.product.isTrackInventory ? $t("PRD50000.YES") : $t("PRD50000.NO") }}
								</ion-badge>
							</ion-label>
						</ion-item>
						<ion-item>
							<ion-toggle :key="batchKey" :checked="!!store.product.isBatchTracked" :disabled="batchSaving" @ion-change="onToggleBatch($event.detail.checked)">
								<ion-label>
									{{ $t("PRD50000.BATCH_TRACKED") }}
									<p class="pd_hint">{{ $t("PRD50000.BATCH_TRACKED_HINT") }}</p>
								</ion-label>
							</ion-toggle>
						</ion-item>
						<ion-item><ion-label><p>{{ $t("PRD50000.SLUG") }}</p><h3 class="pd_value">{{ store.product.slug || "—" }}</h3></ion-label></ion-item>
						<ion-item :button="!!store.product.attachmentFile" :detail="!!store.product.attachmentFile" @click="store.product.attachmentFile && openUrl(store.product.attachmentFile)">
							<ion-label>
								<p>{{ $t("PRD50000.ATTACHMENT") }}</p>
								<h3 class="pd_value" :class="{ pd_link: store.product.attachmentFile }">{{ store.product.attachmentFile ? $t("PRD50000.OPEN_FILE") : "—" }}</h3>
							</ion-label>
						</ion-item>
						<ion-item><ion-label><p>{{ $t("PRD50000.DESCRIPTION") }}</p><h3 class="pd_value pd_pre">{{ store.product.description || "—" }}</h3></ion-label></ion-item>
						<ion-item><ion-label><p>{{ $t("PRD50000.USAGE_INSTRUCTIONS") }}</p><h3 class="pd_value pd_pre">{{ store.product.usageInstructions || "—" }}</h3></ion-label></ion-item>
						<ion-item v-for="f in store.product.customFields ?? []" :key="f.fieldId"><ion-label><p>{{ f.label }}</p><h3 class="pd_value pd_pre">{{ f.value }}</h3></ion-label></ion-item>
						<ion-item>
							<ion-label><p>{{ $t("PRD50000.CREATED") }}</p><h3 class="pd_value">{{ fmtDateTime(store.product.createdAt) }}<span v-if="store.product.createdByName"> · {{ store.product.createdByName }}</span></h3></ion-label>
						</ion-item>
						<ion-item>
							<ion-label><p>{{ $t("PRD50000.UPDATED") }}</p><h3 class="pd_value">{{ fmtDateTime(store.product.updatedAt) }}<span v-if="store.product.updatedByName"> · {{ store.product.updatedByName }}</span></h3></ion-label>
						</ion-item>
					</ion-list>
				</template>

				<ProductVariantsTab v-else-if="activeTab === 'variants'" :product-id="store.product.productId" readonly />

				<!-- History tabs -->
				<template v-else>
					<ion-progress-bar v-if="currentTab.loading" type="indeterminate" />
					<ion-list v-if="currentTab.rows.length" class="scr_list" lines="full">
						<ion-item v-for="(r, i) in currentTab.rows" :key="(r.recordId ?? '') + '_' + i">
							<ion-label>
								<p class="pd_code_sm">{{ historyTitle(r) }}</p>
								<p v-for="c in currentColumns" :key="c.key">{{ c.title }}: <span :class="cellClass(c.key, r)">{{ cell(c.key, r) }}</span></p>
							</ion-label>
							<ion-badge v-if="r.status" slot="end" color="medium">{{ r.status }}</ion-badge>
						</ion-item>
					</ion-list>
					<bm-empty-state v-else-if="!currentTab.loading" />
					<!-- the store pages history (page replaces rows), so this is a pager, not infinite scroll -->
					<div v-if="pageCount > 1" class="pd_pager">
						<ion-button fill="clear" size="small" :disabled="currentTab.loading || currentTab.page <= 1" @click="onPage(currentTab.page - 1)">
							<ion-icon slot="icon-only" :icon="chevronBack" />
						</ion-button>
						<span>{{ currentTab.page }} / {{ pageCount }}</span>
						<ion-button fill="clear" size="small" :disabled="currentTab.loading || currentTab.page >= pageCount" @click="onPage(currentTab.page + 1)">
							<ion-icon slot="icon-only" :icon="chevronForward" />
						</ion-button>
					</div>
				</template>
			</template>
			<bm-empty-state v-else description="PRD50000.NOT_FOUND" />
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { chevronBack, chevronForward } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { BizCheckMobileSystem } from "@/shared/bizcheckmobile";
import { PRD50000Store } from "@/store/POS/PRD/PRD50000Store";
import SetBatchTracked from "@/services/api/PRD/setBatchTracked";
import type { ProductHistoryRow, ProductHistoryType } from "@/services/api/PRD/retrieveProductHistory";
import ProductVariantsTab from "@/views/POS/PRD/ProductVariantsTab.vue";

/** PRD50000 — product detail: info + gallery, batch-tracking switch, variants (read-only) and paged history tabs. */
defineOptions({ name: "PRD50000" });

type TabKey = "detail" | "variants" | ProductHistoryType;
const TABS: { key: TabKey; label: string }[] = [
	{ key: "detail", label: "TAB_DETAIL" },
	{ key: "variants", label: "TAB_VARIANTS" },
	{ key: "sale", label: "TAB_SALE" },
	{ key: "quotation", label: "TAB_QUOTATION" },
	{ key: "purchase", label: "TAB_PURCHASE" },
	{ key: "transfer", label: "TAB_TRANSFER" },
	{ key: "adjustment", label: "TAB_ADJUSTMENT" },
	{ key: "movement", label: "TAB_MOVEMENT" }
];

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const store = PRD50000Store();
const activeTab = ref<TabKey>("detail");
const batchSaving = ref(false);
/** Re-renders the batch switch so a failed save snaps back to the stored value. */
const batchKey = ref(0);

const code = computed(() => String(route.query.productCode ?? ""));
const isHistory = (k: TabKey): k is ProductHistoryType => k !== "detail" && k !== "variants";

useViewEnter(() => {
	if (!code.value) { router.replace("/PRD10000"); return; }
	store.load(code.value);
});

const money = (v: number | undefined) => `$ ${Number(v ?? 0).toFixed(2)}`;
const percent = (v: number | undefined) => (v === undefined || v === null ? "—" : `${Number(v)}%`);
const num = (v: number | undefined) => (v === undefined || v === null ? "—" : String(Number(v)));
const fmtDateTime = (v: string | undefined) => (v ? String(v).replace("T", " ").slice(0, 16) : "—");
const openUrl = (url: string) => void BizCheckMobileSystem.callBrowser({ url });

const imageList = computed<string[]>(() => {
	const p = store.product;
	if (!p) return [];
	let list: string[] = [];
	const raw = p.images;
	if (Array.isArray(raw)) list = raw.filter(Boolean);
	else if (typeof raw === "string" && raw.trim()) {
		try { const a = JSON.parse(raw); if (Array.isArray(a)) list = a.filter(Boolean); } catch { /* ignore */ }
	}
	if (!list.length && p.imageUrl) list = [p.imageUrl];
	return list;
});

const detailRows = computed(() => {
	const p = store.product;
	if (!p) return [];
	const L = (k: string) => t(`PRD50000.${k}`);
	return [
		{ label: L("BARCODE"), value: p.barcode || "—" },
		{ label: L("SECONDARY_CODE"), value: p.productCodeSecondary || "—" },
		{ label: L("CATEGORY"), value: p.categoryName || "—" },
		{ label: L("BRAND"), value: p.brandName || "—" },
		{ label: L("UNIT"), value: p.unitName || p.unitOfMeasure || "—" },
		{ label: L("PRODUCT_TYPE"), value: p.productTypeName || "—" },
		{ label: L("SKIN_CONDITION"), value: p.skinConditionName || "—" },
		{ label: L("SIZE"), value: p.productSize || "—" },
		{ label: L("COST_PRICE"), value: money(p.costPrice) },
		{ label: L("WHOLESALE_PRICE"), value: money(p.wholesalePrice) },
		{ label: L("MIN_SELLING_PRICE"), value: money(p.minSellingPrice) },
		{ label: L("TAX_RATE"), value: percent(p.taxRate) },
		{ label: L("REORDER_POINT"), value: num(p.reorderPoint) },
		{ label: L("REORDER_QUANTITY"), value: num(p.reorderQuantity) }
	];
});

function onToggleBatch(enabled: boolean): void {
	const p = store.product;
	if (!p?.productId || enabled === !!p.isBatchTracked) return;
	batchSaving.value = true;
	SetBatchTracked.getInstance().request({
		dataBody: { productId: p.productId, enabled },
		listener: {
			onSuccess: (r) => { if (store.product) store.product.isBatchTracked = r.isBatchTracked; batchSaving.value = false; },
			onFail: (err) => { POP.apiError(err); batchSaving.value = false; batchKey.value++; }
		}
	});
}

// History tabs load lazily once per product (store cache); a reload resets them.
const currentTab = computed(() => (isHistory(activeTab.value) ? store.history[activeTab.value] : null)
	?? { rows: [] as ProductHistoryRow[], total: 0, page: 1, loading: false, loaded: false });
const pageCount = computed(() => Math.ceil(currentTab.value.total / store.pageSize));
watch([activeTab, () => store.loading], ([tab, busy]) => { if (!busy && store.product && isHistory(tab)) store.ensureHistory(tab); });
function onPage(page: number): void {
	if (isHistory(activeTab.value)) store.loadHistory(activeTab.value, page);
}

type ColKey = keyof ProductHistoryRow | "movement" | "change";
/** Columns after the title line (code/reference + date), per history type. */
const currentColumns = computed<{ key: ColKey; title: string }[]>(() => {
	const c = (key: ColKey, k: string) => ({ key, title: t(`PRD50000.COL_${k}`) });
	const map: Record<ProductHistoryType, { key: ColKey; title: string }[]> = {
		sale: [c("partyName", "CUSTOMER"), c("inventoryName", "INVENTORY"), c("quantity", "QTY"), c("unitPrice", "PRICE"), c("amount", "TOTAL")],
		quotation: [c("partyName", "CUSTOMER"), c("quantity", "QTY"), c("unitPrice", "PRICE"), c("amount", "TOTAL")],
		purchase: [c("partyName", "SUPPLIER"), c("inventoryName", "INVENTORY"), c("quantity", "QTY"), c("unitPrice", "UNIT_COST"), c("amount", "TOTAL")],
		transfer: [c("movement", "MOVEMENT"), c("quantity", "QTY")],
		adjustment: [c("inventoryName", "INVENTORY"), c("reason", "TYPE"), c("change", "CHANGE")],
		movement: [c("movementType", "TYPE"), c("inventoryName", "INVENTORY"), c("quantityChange", "QTY_CHANGE")]
	};
	return isHistory(activeTab.value) ? map[activeTab.value] : [];
});

function historyTitle(r: ProductHistoryRow): string {
	return activeTab.value === "movement"
		? `${r.referenceCode ?? "—"} · ${r.movementDate ?? ""}`
		: `${r.code ?? "—"} · ${r.date ?? ""}`;
}
const signed = (v: number | undefined) => `${Number(v) > 0 ? "+" : ""}${num(v)}`;
function cell(key: ColKey, r: ProductHistoryRow): string {
	switch (key) {
		case "quantity": return num(r.quantity);
		case "unitPrice": return money(r.unitPrice);
		case "amount": return money(r.amount);
		case "quantityChange": return signed(r.quantityChange);
		case "movement": return `${r.fromInventoryName ?? ""} → ${r.toInventoryName ?? ""}`;
		case "change": return `${num(r.quantityBefore)} → ${num(r.quantityAfter)} (${signed(r.quantityDifference)})`;
		default: return String(r[key] ?? "—");
	}
}
function cellClass(key: ColKey, r: ProductHistoryRow): string {
	const v = key === "quantityChange" ? r.quantityChange : key === "change" ? r.quantityDifference : undefined;
	if (v === undefined) return "";
	return Number(v) < 0 ? "qty_neg" : "qty_pos";
}
</script>

<style scoped>
.pd_code { font-size: 12px; font-weight: 600; padding: 8px 16px 0; margin: 0; }
.pd_gallery { display: flex; flex-wrap: wrap; gap: 8px; padding: 8px 16px; }
.pd_gallery img { width: 72px; height: 72px; object-fit: contain; border: 1px solid #ddd; border-radius: 8px; background: #fff; }
.pd_price_head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 8px 16px; }
.pd_price_label { font-size: 10px; text-transform: uppercase; color: var(--ion-color-medium); margin: 0 0 4px; }
.pd_price_val { font-size: 16px; font-weight: 700; margin: 0; }
.pd_value { font-size: 14px; white-space: normal; }
.pd_pre { white-space: pre-wrap; }
.pd_link { color: var(--ion-color-primary); }
.pd_hint { font-size: 12px; white-space: normal; }
.pd_code_sm { font-size: 12px; font-weight: 600; }
.pd_pager { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 12px; padding: 8px 0; }
.qty_pos { color: #1B6B3A; font-weight: 600; }
.qty_neg { color: #B42318; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
