<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" :default-href="backHref" />
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<bm-empty-state v-else-if="store.notFound || !store.editable" :description="store.notFound ? 'SAL47000.NOT_FOUND' : 'SAL47000.NOT_EDITABLE'" />
			<template v-else>
				<p class="dl_picked"><strong>{{ store.deliveryCode }}</strong> · {{ tr("SALE_CODE") }}: {{ store.saleCode || "—" }}</p>
				<DeliveryFormFields :store="store" :customer-id="store.customerId" ns="SAL47000" />
			</template>
		</ion-content>
		<ion-footer v-if="!store.loading && !store.notFound && store.editable">
			<ion-toolbar class="sal_btns">
				<ion-button fill="outline" @click="router.push(backHref)">{{ tr("CANCEL") }}</ion-button>
				<ion-button :disabled="store.submitting" @click="store.submit(tr('FAILED'))">{{ tr("SAVE") }}</ion-button>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useViewEnter } from "@/core/modules/use-view-enter";
import DeliveryFormFields from "@/views/POS/SAL/DeliveryFormFields.vue";
import { SAL47000Store } from "@/store/POS/SAL/SAL47000Store";

/** Delivery edit (PENDING only): driver, receiver, address, schedule, notes. */
defineOptions({ name: "SAL47000" });

const { t } = useI18n();
const tr = (k: string) => t(`SAL47000.${k}`);
const route = useRoute();
const router = useRouter();
const store = SAL47000Store();
const deliveryId = computed(() => String(route.query.deliveryId ?? ""));
const backHref = computed(() => `/SAL74000?deliveryId=${encodeURIComponent(deliveryId.value)}`);

useViewEnter(() => {
	store.$reset();
	store.loadForEdit(deliveryId.value, tr("FAILED"));
});
watch(() => store.redirectTo, (to) => { if (to && route.path === "/SAL47000") router.push(to); });
</script>

<style scoped>
.dl_picked { font-size: 14px; padding: 8px 16px 0; margin: 0; }
.sal_btns { --padding-start: 16px; --padding-end: 16px; }
.sal_btns ion-button { width: calc(50% - 4px); }
</style>
