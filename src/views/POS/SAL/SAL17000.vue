<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" :default-href="`/SAL15000?quotationNo=${encodeURIComponent(quotationNo)}`" />
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<bm-empty-state v-else-if="store.notFound" :description="'SAL17000.NOT_FOUND'" />
			<template v-else>
				<ion-note class="sal_code">{{ store.quotationNo }}</ion-note>
				<QuotationFormFields :store="store" @pick="store.onPickProduct" />
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
import { computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useViewEnter } from "@/core/modules/use-view-enter";
import QuotationFormFields from "@/views/POS/SAL/QuotationFormFields.vue";
import { SAL17000Store } from "@/store/POS/SAL/SAL17000Store";

/** Quotation edit: refill from the detail, edit like the create form, save (no confirm step). */
defineOptions({ name: "SAL17000" });

const { t } = useI18n();
const tr = (k: string) => t(`SAL17000.${k}`);
const route = useRoute();
const router = useRouter();
const store = SAL17000Store();
const quotationNo = computed(() => String(route.query.quotationNo ?? ""));

useViewEnter(() => {
	// Clear a stale redirect so this save's null→target change fires the watcher.
	store.redirectTo = null;
	store.loadForEdit(quotationNo.value);
});
watch(() => store.redirectTo, (to) => { if (to && route.path === "/SAL17000") router.replace(to); });
</script>

<style scoped>
.sal_code { display: block; padding: 8px 16px 0; font-size: 12px; }
.sal_btns { --padding-start: 16px; --padding-end: 16px; }
</style>
