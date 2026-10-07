<template>
	<div>
		<ion-list class="scr_list" lines="full">
			<ion-item>
				<ion-input v-model="store.customerName" :label="`${sc('CUSTOMER')} *`" label-placement="stacked" :placeholder="sc('CUSTOMER_PH')" :clear-input="true" />
			</ion-item>
			<ion-item>
				<ion-input v-model="store.customerPhone" :label="sc('PHONE')" label-placement="stacked" type="tel" :placeholder="sc('PHONE_PH')" :clear-input="true" />
			</ion-item>
			<ion-item>
				<ion-select v-model="store.inventoryId" :label="`${sc('INVENTORY')} *`" label-placement="stacked" :placeholder="sc('INVENTORY')" interface="action-sheet">
					<ion-select-option v-for="i in store.inventories" :key="i.inventoryId" :value="i.inventoryId">{{ i.inventoryName }}</ion-select-option>
				</ion-select>
			</ion-item>
			<ion-item>
				<ion-input v-model="store.quotationDate" :label="`${sc('DATE')} *`" label-placement="stacked" type="date" />
			</ion-item>
		</ion-list>
		<SearchPickField
			:label="sc('ADD_PRODUCT')"
			:options="store.productResults.map((p) => ({ value: p.productId, label: `${p.productName} · ${money(p.sellingPrice)}` }))"
			:searching="store.searching"
			:placeholder="sc('SEARCH_PRODUCT')"
			@search="store.searchProducts"
			@pick="emit('pick', $event)" />

		<ion-list class="scr_list" lines="full">
			<ion-item v-for="(l, i) in store.lines" :key="i">
				<div class="qf_line">
					<div class="qf_head">
						<div>
							<h3>{{ l.itemName }}<template v-if="l.variantName"> — {{ l.variantName }}</template></h3>
							<p>{{ l.itemCode }}</p>
						</div>
						<ion-button fill="clear" color="danger" size="small" @click="store.removeLine(i)"><ion-icon slot="icon-only" :icon="closeOutline" /></ion-button>
					</div>
					<div class="qf_inputs">
						<ion-input :value="l.quantity" :label="sc('QTY')" label-placement="stacked" type="number" min="1" inputmode="numeric" @ion-change="store.setQty(i, num($event.detail.value))" />
						<ion-input :value="l.unitPrice" :label="sc('PRICE')" label-placement="stacked" type="number" min="0" step="0.01" inputmode="decimal" @ion-change="store.setPrice(i, num($event.detail.value))" />
						<ion-input :value="l.discountAmount" :label="sc('DISCOUNT')" label-placement="stacked" type="number" min="0" step="0.01" inputmode="decimal" @ion-change="store.setDiscount(i, num($event.detail.value))" />
					</div>
					<p class="qf_amt">{{ sc("AMOUNT") }}: <strong>{{ money(store.lineTotal(l)) }}</strong></p>
				</div>
			</ion-item>
			<ion-item v-if="!store.lines.length" lines="none"><ion-note>{{ sc("NO_LINES") }}</ion-note></ion-item>
			<ion-item>
				<ion-textarea v-model="store.remark" :label="sc('REMARK')" label-placement="stacked" :rows="2" :auto-grow="true" />
			</ion-item>
		</ion-list>

		<div class="qf_sums">
			<div><span>{{ sc("SUBTOTAL") }}</span><span>{{ money(store.subTotal) }}</span></div>
			<div><span>{{ sc("LINE_DISCOUNT") }}</span><span>-{{ money(store.discountTotal) }}</span></div>
			<div class="qf_total"><span>{{ sc("TOTAL") }}</span><strong>{{ money(store.totalAmount) }}</strong></div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { closeOutline } from "ionicons/icons";
import UT from "@/core/utilities/ut";
import SearchPickField from "@/views/POS/SAL/SearchPickField.vue";
import type { QuotationLine } from "@/models/POS/SAL/SAL12000";
import type { ProductListItem } from "@/models/PRD/PRD10000";
import type { InventoryLookup } from "@/models/POS/COMMON/lookups";

/** Quotation form body shared by create (SAL12000) and edit (SAL17000); both stores have this shape. */
defineOptions({ name: "QuotationFormFields" });

export interface QuotationFormStore {
	customerName: string;
	customerPhone: string;
	inventoryId?: string;
	quotationDate: string;
	remark: string;
	inventories: InventoryLookup[];
	productResults: ProductListItem[];
	searching: boolean;
	lines: QuotationLine[];
	subTotal: number;
	discountTotal: number;
	totalAmount: number;
	searchProducts(kw: string): void;
	lineTotal(l: QuotationLine): number;
	setQty(i: number, v: number): void;
	setPrice(i: number, v: number): void;
	setDiscount(i: number, v: number): void;
	removeLine(i: number): void;
}

defineProps<{ store: QuotationFormStore }>();
const emit = defineEmits<{ pick: [string] }>();
const { t } = useI18n();
const sc = (k: string) => t(`SAL12000.${k}`);
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");
const num = (v: unknown) => Number(v ?? 0);
</script>

<style scoped>
.qf_line { width: 100%; padding: 8px 0; }
.qf_head { display: flex; justify-content: space-between; align-items: flex-start; }
.qf_head h3 { font-size: 14px; font-weight: 600; margin: 0; }
.qf_head p { font-size: 12px; color: var(--ion-color-medium); margin: 2px 0 0; }
.qf_inputs { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.qf_amt { font-size: 12px; text-align: right; margin: 4px 0 0; }
.qf_sums { padding: 8px 16px; font-size: 14px; }
.qf_sums > div { display: flex; justify-content: space-between; padding: 2px 0; }
.qf_total { border-top: 1px solid var(--ion-color-light-shade); margin-top: 4px; padding-top: 8px !important; font-size: 16px; }
</style>
