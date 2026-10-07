<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/PUR10000" />
		<ion-content>
			<ion-list class="scr_list" lines="full">
				<ion-item>
					<ion-select v-model="store.supplierId" :label="`${tr('SUPPLIER')} *`" label-placement="stacked" :placeholder="tr('SUPPLIER_PH')" interface="action-sheet">
						<ion-select-option v-for="s in store.suppliers" :key="s.supplierId" :value="s.supplierId">{{ supplierLabel(s) }}</ion-select-option>
					</ion-select>
				</ion-item>
				<ion-item>
					<ion-select v-model="store.inventoryId" :label="`${tr('INVENTORY')} *`" label-placement="stacked" :placeholder="tr('INVENTORY_PH')" interface="action-sheet">
						<ion-select-option v-for="inv in store.inventories" :key="inv.inventoryId" :value="inv.inventoryId">{{ inv.inventoryName }}</ion-select-option>
					</ion-select>
				</ion-item>
				<ion-item>
					<ion-input v-model="store.orderDate" type="date" :label="`${tr('ORDER_DATE')} *`" label-placement="stacked" />
				</ion-item>
				<ion-item>
					<ion-input :value="store.expectedDeliveryDate ?? ''" type="date" :label="tr('EXPECTED_DATE')" label-placement="stacked"
						@ion-input="store.expectedDeliveryDate = String($event.detail.value ?? '') || undefined" />
				</ion-item>
				<ion-note v-if="store.expectedDateInvalid" color="danger" class="pur_err">{{ tr("EXPECTED_BEFORE_ORDER") }}</ion-note>
				<ion-item>
					<ion-input v-model="store.paymentTerm" :label="tr('PAYMENT_TERM')" label-placement="stacked" :placeholder="tr('PAYMENT_TERM_PH')" clear-input />
				</ion-item>

				<ion-list-header>{{ tr("ADD_PRODUCT") }}</ion-list-header>
				<ion-searchbar v-model="productKw" :placeholder="tr('SEARCH_PRODUCT')" :debounce="0" @ion-input="onProductSearch" />
				<template v-if="productKw.trim()">
					<ion-item v-for="p in store.productResults" :key="p.productId" button :detail="false" @click="onPickProduct(p.productId)">
						<ion-label>
							<h3>{{ p.productName }}</h3>
							<p>{{ p.productCode }}</p>
						</ion-label>
						<ion-note slot="end">{{ money(p.costPrice ?? p.sellingPrice ?? 0) }}</ion-note>
					</ion-item>
				</template>

				<ion-list-header>{{ tr("PRODUCT") }}</ion-list-header>
				<div v-for="(l, i) in store.lines" :key="`${l.productId}|${l.variantId ?? ''}`" class="pur_line">
					<ion-item lines="none">
						<ion-label>
							<h3>{{ l.productName }}<template v-if="l.variantName"> — {{ l.variantName }}</template></h3>
							<p>{{ l.productCode }}</p>
						</ion-label>
						<ion-button slot="end" fill="clear" color="danger" @click="store.removeLine(i)"><ion-icon slot="icon-only" :icon="closeOutline" /></ion-button>
					</ion-item>
					<div class="pur_grid">
						<ion-input :value="l.orderedQuantity" type="number" inputmode="numeric" min="1" :label="tr('QTY')" label-placement="stacked" fill="outline" @ion-change="store.setQty(i, Number($event.detail.value))" />
						<ion-input :value="l.unitCost" type="number" inputmode="decimal" min="0" step="0.01" :label="tr('UNIT_COST')" label-placement="stacked" fill="outline" @ion-change="store.setCost(i, Number($event.detail.value))" />
						<ion-input :value="l.discountAmount" type="number" inputmode="decimal" min="0" step="0.01" :label="tr('DISCOUNT')" label-placement="stacked" fill="outline" @ion-change="store.setDiscount(i, Number($event.detail.value))" />
						<ion-input :value="l.taxRate" type="number" inputmode="decimal" min="0" max="100" step="0.1" :label="tr('TAX_RATE')" label-placement="stacked" fill="outline" @ion-change="store.setTaxRate(i, Number($event.detail.value))" />
					</div>
					<p class="pur_line_sum">{{ tr("TAX_AMOUNT") }} {{ money(store.lineTax(l)) }} · {{ tr("AMOUNT") }} <b>{{ money(store.lineTotal(l)) }}</b></p>
				</div>
				<ion-item v-if="!store.lines.length"><ion-note>{{ tr("NO_LINES") }}</ion-note></ion-item>

				<ion-item>
					<ion-textarea v-model="store.remark" :label="tr('REMARK')" label-placement="stacked" auto-grow :rows="2" />
				</ion-item>
			</ion-list>
		</ion-content>
		<ion-footer>
			<ion-toolbar>
				<div class="pur_sum">
					<div><span>{{ tr("SUBTOTAL") }}</span><span>{{ money(store.subTotal) }}</span></div>
					<div><span>{{ tr("DISCOUNT_TOTAL") }}</span><span>-{{ money(store.discountTotal) }}</span></div>
					<div><span>{{ tr("TAX_TOTAL") }}</span><span>{{ money(store.taxTotal) }}</span></div>
					<div class="total"><span>{{ tr("GRAND_TOTAL") }}</span><strong>{{ money(store.grandTotal) }}</strong></div>
				</div>
				<div class="pur_btns">
					<ion-button fill="outline" @click="router.push('/PUR10000')">{{ tr("CANCEL") }}</ion-button>
					<ion-button :disabled="!store.canConfirm" @click="confirm">{{ tr("CONFIRM") }}</ion-button>
				</div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { closeOutline } from "ionicons/icons";
import UT from "@/core/utilities/ut";
import POP from "@/core/utilities/pop";
import VariantPickerModal from "@/views/POS/SAL/VariantPickerModal.vue";
import { PUR11000Store } from "@/store/POS/PUR/PUR11000Store";
import type { SellableVariant } from "@/models/POS/SAL/SellableVariant";
import type { SupplierLookup } from "@/models/POS/COMMON/lookups";

/** New purchase order: header, product lines (qty/cost/discount/tax), totals → PUR12000 confirm. */
defineOptions({ name: "PUR11000" });

const { t } = useI18n();
const tr = (k: string) => t(`PUR11000.${k}`);
const router = useRouter();
const store = PUR11000Store();
const productKw = ref("");
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");
const supplierLabel = (s: SupplierLookup) => s.supplierName || s.contactName || s.supplierCode || "—";

function onProductSearch(): void {
	if (productKw.value.trim()) store.searchProducts(productKw.value.trim());
}
/** A product with variants asks which one before the line is added. */
function onPickProduct(productId: string): void {
	const p = store.productResults.find((x) => x.productId === productId);
	productKw.value = "";
	if (!p?.hasVariants) { store.onPickProduct(productId); return; }
	store.productPick = undefined;
	POP.showPopup<SellableVariant>(VariantPickerModal, {
		title: `${t("POS10000.VARIANT_TITLE")} — ${p.productName}`,
		props: { productId, inventoryId: store.inventoryId }
	}).promise.then((res) => { if (res.data) store.onPickProduct(productId, res.data); }).catch(() => undefined);
}
function confirm(): void {
	if (store.buildAndSaveDraft()) router.push("/PUR12000");
}

onMounted(() => {
	store.loadSuppliers();
	store.loadTaxDefaults();
	store.loadInventories();
});
</script>

<style scoped>
.pur_err { display: block; padding: 4px 16px; font-size: 12px; }
.pur_line { border-bottom: 1px solid var(--ion-color-light-shade); padding-bottom: 8px; }
.pur_line h3 { font-size: 14px; font-weight: 600; }
.pur_line p { font-size: 12px; }
.pur_grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 0 16px; }
.pur_line_sum { padding: 8px 16px 0; text-align: right; }
.pur_sum { padding: 8px 16px 0; font-size: 12px; }
.pur_sum > div { display: flex; justify-content: space-between; padding: 2px 0; }
.pur_sum .total { font-size: 16px; padding-top: 4px; }
.pur_btns { display: flex; gap: 8px; padding: 8px 12px; }
.pur_btns ion-button { flex: 1; }
</style>
