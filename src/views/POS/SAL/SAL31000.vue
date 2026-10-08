<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/SAL30000">
			<template #bottom>
				<ion-toolbar>
					<ion-segment :value="store.sourceType" :disabled="store.locked" @ion-change="store.setSource($event.detail.value as 'SALE' | 'MANUAL')">
						<ion-segment-button value="SALE"><ion-label>{{ tr("SOURCE_SALE") }}</ion-label></ion-segment-button>
						<ion-segment-button value="MANUAL"><ion-label>{{ tr("SOURCE_MANUAL") }}</ion-label></ion-segment-button>
					</ion-segment>
				</ion-toolbar>
			</template>
		</bm-header>
		<ion-content>
			<template v-if="store.sourceType === 'SALE'">
				<SearchPickField
					:label="tr('FIND_SALE')"
					:options="store.saleResults.map((s) => ({ value: s.saleId, label: `${s.saleCode} · ${s.customerName || tr('NO_CUSTOMER')}` }))"
					:searching="store.searchingSale"
					:disabled="store.locked"
					:placeholder="tr('SEARCH_SALE')"
					@search="store.searchSales"
					@pick="store.onPickSale" />
				<p v-if="store.selectedSale" class="pk_picked">
					{{ tr("SELECTED_SALE") }}: <strong>{{ store.selectedSale.saleCode }}</strong>
					<template v-if="store.selectedSale.customerName"> · {{ store.selectedSale.customerName }}</template>
				</p>
			</template>
			<template v-else>
				<SearchPickField
					:label="tr('ADD_PRODUCT')"
					:options="store.productResults.map((p) => ({ value: p.productId, label: `${p.productName} · ${p.productCode}` }))"
					:searching="store.searchingProduct"
					:placeholder="tr('SEARCH_PRODUCT')"
					@search="store.searchProducts"
					@pick="store.onPickProduct" />
			</template>
			<PackagingFormFields :store="store" :loading-items="store.loadingItems" />
		</ion-content>
		<ion-footer>
			<ion-toolbar class="sal_btns">
				<ion-button expand="block" :disabled="!store.canConfirm" @click="confirm">{{ tr("CONFIRM") }}</ion-button>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useViewEnter } from "@/core/modules/use-view-enter";
import SearchPickField from "@/views/POS/SAL/SearchPickField.vue";
import PackagingFormFields from "@/views/POS/SAL/PackagingFormFields.vue";
import { SAL31000Store } from "@/store/POS/SAL/SAL31000Store";

/** Packing create step 1: from a sale (its lines) or manual products; ?saleCode= locks the sale. */
defineOptions({ name: "SAL31000" });

const { t } = useI18n();
const tr = (k: string) => t(`SAL31000.${k}`);
const route = useRoute();
const router = useRouter();
const store = SAL31000Store();

// Ionic reuses this page: keep the draft only when coming back from the confirm step (same ?saleCode, still
// confirmable); after a confirm step $reset() the store, or on a new ?saleCode, start fresh and reload packers.
let appliedCode: string | null = null;
useViewEnter(() => {
	const code = String(route.query.saleCode ?? "");
	if (code === appliedCode && store.canConfirm) return;
	appliedCode = code;
	store.$reset();
	store.loadPackers();
	if (code) store.preselectSale(code);
});
function confirm(): void {
	if (store.buildAndSaveDraft()) router.push("/SAL32000");
}
</script>

<style scoped>
.pk_picked { font-size: 14px; padding: 0 16px; }
.sal_btns { --padding-start: 16px; --padding-end: 16px; }
</style>
