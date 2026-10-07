<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/SAL11000" />
		<ion-content>
			<QuotationFormFields :store="store" @pick="onPickProduct" />
		</ion-content>
		<ion-footer>
			<ion-toolbar class="sal_btns">
				<ion-button expand="block" :disabled="!store.canConfirm" @click="confirm">{{ tr("CONFIRM") }}</ion-button>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import POP from "@/core/utilities/pop";
import { useViewEnter } from "@/core/modules/use-view-enter";
import QuotationFormFields from "@/views/POS/SAL/QuotationFormFields.vue";
import VariantPickerModal from "@/views/POS/SAL/VariantPickerModal.vue";
import type { SellableVariant } from "@/models/POS/SAL/SellableVariant";
import { SAL12000Store } from "@/store/POS/SAL/SAL12000Store";

/** Quotation create step 1: customer, inventory, lines (variant products ask which variant). */
defineOptions({ name: "SAL12000" });

const { t } = useI18n();
const tr = (k: string) => t(`SAL12000.${k}`);
const router = useRouter();
const store = SAL12000Store();

useViewEnter(() => void store.loadInventories());

function onPickProduct(productId: string): void {
	const p = store.productResults.find((x) => x.productId === productId);
	if (!p?.hasVariants) { store.onPickProduct(productId); return; }
	store.productPick = undefined;
	POP.showPopup<SellableVariant>(VariantPickerModal, {
		title: `${t("POS10000.VARIANT_TITLE")} — ${p.productName}`,
		props: { productId, inventoryId: store.inventoryId }
	}).promise
		.then((res) => { if (res.data) store.onPickProduct(productId, res.data); })
		.catch(() => undefined);
}
function confirm(): void {
	if (store.buildAndSaveDraft()) router.push("/SAL13000");
}
</script>

<style scoped>
.sal_btns { --padding-start: 16px; --padding-end: 16px; }
</style>
