<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/SAL20000" />
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<bm-empty-state v-else-if="store.notFound" :description="'SAL27000.NOT_FOUND'" />
			<template v-else>
				<ion-list class="scr_list" lines="full">
					<ion-item>
						<ion-label><p>{{ store.returnCode }} · {{ sc("SALE_CODE") }} {{ store.saleCode }}</p><h3>{{ store.customerName || "—" }}</h3></ion-label>
					</ion-item>
				</ion-list>
				<ReturnLinesFields :store="store" />
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
import ReturnLinesFields from "@/views/POS/SAL/ReturnLinesFields.vue";
import { SAL27000Store } from "@/store/POS/SAL/SAL27000Store";

/** Sale-return edit (PENDING only): refill, edit qty/refund per line, save (no confirm step). */
defineOptions({ name: "SAL27000" });

const { t } = useI18n();
const tr = (k: string) => t(`SAL27000.${k}`);
const sc = (k: string) => t(`SAL21000.${k}`);
const route = useRoute();
const router = useRouter();
const store = SAL27000Store();

useViewEnter(() => {
	store.$reset();
	store.loadForEdit(String(route.query.returnId ?? ""));
});
watch(() => store.redirectTo, (to) => { if (to && route.path === "/SAL27000") router.replace(to); });
</script>

<style scoped>
.sal_btns { --padding-start: 16px; --padding-end: 16px; }
ion-label h3 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
