<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/SAL41000" />
		<ion-content>
			<bm-empty-state v-if="!store.draft" :description="'SAL52000.NO_DRAFT'" />
			<ion-list v-else class="scr_list" lines="full">
				<ion-item><ion-label><p>{{ tr("SALE_CODE") }}</p><h3>{{ store.draft.display.saleCode }}</h3></ion-label></ion-item>
				<ion-item v-if="store.draft.display.customerName"><ion-label><p>{{ tr("CUSTOMER_NAME") }}</p><h3>{{ store.draft.display.customerName }}</h3></ion-label></ion-item>
				<ion-item v-if="store.draft.display.customerPhone"><ion-label><p>{{ tr("CUSTOMER_PHONE") }}</p><h3>{{ store.draft.display.customerPhone }}</h3></ion-label></ion-item>
				<ion-item v-if="store.draft.display.deliveryAddress"><ion-label><p>{{ tr("DELIVERY_ADDRESS") }}</p><h3>{{ store.draft.display.deliveryAddress }}</h3></ion-label></ion-item>
				<ion-item v-if="store.draft.display.driverName"><ion-label><p>{{ tr("DRIVER") }}</p><h3>{{ store.draft.display.driverName }}</h3></ion-label></ion-item>
				<ion-item v-if="store.draft.display.scheduledDate"><ion-label><p>{{ tr("SCHEDULED_DATE") }}</p><h3>{{ store.draft.display.scheduledDate }}</h3></ion-label></ion-item>
			</ion-list>
		</ion-content>
		<ion-footer>
			<ion-toolbar class="sal_btns">
				<ion-button fill="outline" :disabled="store.submitting" @click="router.back()">{{ tr("BACK") }}</ion-button>
				<ion-button :disabled="!store.draft || store.submitting" @click="store.submit(tr('FAILED'))">{{ tr("CONFIRM") }}</ion-button>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { SAL52000Store } from "@/store/POS/SAL/SAL52000Store";

/** Delivery create step 2: review and submit (idempotent). */
defineOptions({ name: "SAL52000" });

const { t } = useI18n();
const tr = (k: string) => t(`SAL52000.${k}`);
const route = useRoute();
const router = useRouter();
const store = SAL52000Store();

useViewEnter(() => { if (!store.loadDraft()) router.replace("/SAL41000"); });
watch(() => store.redirectTo, (to) => { if (to && route.path === "/SAL52000") router.replace(to); });
</script>

<style scoped>
.sal_btns { --padding-start: 16px; --padding-end: 16px; }
.sal_btns ion-button { width: calc(50% - 4px); }
ion-label h3 { font-size: 14px; font-weight: 600; white-space: normal; }
ion-label p { font-size: 12px; }
</style>
