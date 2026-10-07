<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/SAL30000" />
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<bm-empty-state v-else-if="store.notFound" :description="'SAL37000.NOT_FOUND'" />
			<template v-else>
				<p class="pk_picked">
					<strong>{{ store.packagingCode }}</strong>
					<template v-if="store.saleCode"> · {{ sc("SELECTED_SALE") }}: {{ store.saleCode }}</template>
				</p>
				<SearchPickField
					:label="sc('ADD_PRODUCT')"
					:options="store.productResults.map((p) => ({ value: p.productId, label: `${p.productName} · ${p.productCode}` }))"
					:searching="store.searchingProduct"
					:placeholder="sc('SEARCH_PRODUCT')"
					@search="store.searchProducts"
					@pick="store.onPickProduct" />
				<PackagingFormFields :store="store" />
			</template>
		</ion-content>
		<ion-footer v-if="!store.loading && !store.notFound">
			<ion-toolbar class="sal_btns">
				<ion-button expand="block" :disabled="!store.canConfirm || store.submitting" @click="store.submit(tr('SAVE_FAILED'))">{{ tr("SAVE") }}</ion-button>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useViewEnter } from "@/core/modules/use-view-enter";
import SearchPickField from "@/views/POS/SAL/SearchPickField.vue";
import PackagingFormFields from "@/views/POS/SAL/PackagingFormFields.vue";
import { SAL37000Store } from "@/store/POS/SAL/SAL37000Store";

/** Packing edit (PENDING only): header + item quantities, save (no confirm step). */
defineOptions({ name: "SAL37000" });

const { t } = useI18n();
const tr = (k: string) => t(`SAL37000.${k}`);
const sc = (k: string) => t(`SAL31000.${k}`);
const route = useRoute();
const router = useRouter();
const store = SAL37000Store();

useViewEnter(() => {
	store.$reset();
	store.loadPackers();
	store.loadForEdit(String(route.query.packagingId ?? ""));
});
watch(() => store.redirectTo, (to) => { if (to && route.path === "/SAL37000") router.replace(to); });
</script>

<style scoped>
.pk_picked { font-size: 14px; padding: 8px 16px 0; margin: 0; }
.sal_btns { --padding-start: 16px; --padding-end: 16px; }
</style>
