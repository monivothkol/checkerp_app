<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/SAL20000">
			<template #bottom>
				<ion-toolbar>
					<ion-searchbar v-model="store.saleCode" :placeholder="tr('SALE_CODE_PH')" :debounce="0" enterkeyhint="search" @keyup.enter="loadSale" />
					<ion-buttons slot="end">
						<ion-button :disabled="!store.saleCode.trim() || store.loadingSale" @click="loadSale">{{ tr("LOAD") }}</ion-button>
					</ion-buttons>
				</ion-toolbar>
			</template>
		</bm-header>
		<ion-content>
			<ion-progress-bar v-if="store.loadingSale" type="indeterminate" />
			<template v-if="store.sale">
				<ion-list class="scr_list" lines="full">
					<ion-item>
						<ion-label><p>{{ tr("SALE_CODE") }}: {{ store.sale.saleCode }}</p><h3>{{ store.sale.customerName || "—" }}</h3></ion-label>
					</ion-item>
				</ion-list>
				<ReturnLinesFields :store="store" />
				<p class="sal_est">{{ tr("ESTIMATE_NOTE") }}</p>
			</template>
		</ion-content>
		<ion-footer v-if="store.sale">
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
import ReturnLinesFields from "@/views/POS/SAL/ReturnLinesFields.vue";
import { SAL21000Store } from "@/store/POS/SAL/SAL21000Store";

/** Sale-return create step 1: look up the sale, pick return qty + refund per line. */
defineOptions({ name: "SAL21000" });

const { t } = useI18n();
const tr = (k: string) => t(`SAL21000.${k}`);
const route = useRoute();
const router = useRouter();
const store = SAL21000Store();

const loadSale = () => store.loadSale(tr("LOAD_FAILED"));
// Ionic reuses this page: keep the draft only when coming back from the confirm step (same ?saleCode, still
// confirmable); otherwise start fresh and re-apply the ?saleCode deep link.
let appliedCode: string | null = null;
useViewEnter(() => {
	const code = String(route.query.saleCode ?? "");
	if (code === appliedCode && store.canConfirm) return;
	appliedCode = code;
	store.$reset();
	if (code) { store.saleCode = code; loadSale(); }
});
function confirm(): void {
	if (store.buildAndSaveDraft()) router.push("/SAL22000");
}
</script>

<style scoped>
.sal_est { font-size: 12px; color: var(--ion-color-medium); padding: 0 16px; }
.sal_btns { --padding-start: 16px; --padding-end: 16px; }
ion-label h3 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
