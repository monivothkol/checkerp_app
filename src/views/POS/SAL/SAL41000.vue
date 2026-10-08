<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/SAL40000" />
		<ion-content>
			<SearchPickField
				:label="`${tr('FIND_SALE')} *`"
				:options="store.saleResults.map((s) => ({ value: s.saleId, label: `${s.saleCode} · ${s.customerName || tr('NO_CUSTOMER')}` }))"
				:searching="store.searchingSale"
				:disabled="store.saleLocked"
				:placeholder="tr('SEARCH_SALE')"
				@search="store.searchSales"
				@pick="store.onPickSale" />
			<p v-if="store.selectedSale" class="dl_picked">
				{{ tr("SELECTED_SALE") }}: <strong>{{ store.selectedSale.saleCode }}</strong>
				<template v-if="store.selectedSale.customerName"> · {{ store.selectedSale.customerName }}</template>
			</p>
			<DeliveryFormFields :store="store" :customer-id="store.selectedSale?.customerId" ns="SAL41000" no-drivers-hint />
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
import DeliveryFormFields from "@/views/POS/SAL/DeliveryFormFields.vue";
import { SAL41000Store } from "@/store/POS/SAL/SAL41000Store";

/** Delivery create step 1: pick a sale (?saleCode= locks it), driver, address, schedule. */
defineOptions({ name: "SAL41000" });

const { t } = useI18n();
const tr = (k: string) => t(`SAL41000.${k}`);
const route = useRoute();
const router = useRouter();
const store = SAL41000Store();

// Ionic reuses this page: keep the draft only when coming back from the confirm step (same ?saleCode, still
// confirmable); after a confirm step $reset() the store, or on a new ?saleCode, start fresh and reload drivers.
let appliedCode: string | null = null;
useViewEnter(() => {
	const code = String(route.query.saleCode ?? "");
	if (code === appliedCode && store.canConfirm) return;
	appliedCode = code;
	store.$reset();
	store.loadContext(code || undefined);
});
function confirm(): void {
	if (store.buildAndSaveDraft()) router.push("/SAL52000");
}
</script>

<style scoped>
.dl_picked { font-size: 14px; padding: 0 16px; }
.sal_btns { --padding-start: 16px; --padding-end: 16px; }
</style>
