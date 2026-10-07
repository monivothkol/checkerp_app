<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #end>
				<ion-button @click="router.push('/ADM31000')">{{ tr("EDIT") }}</ion-button>
			</template>
		</bm-header>
		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)">
				<ion-refresher-content />
			</ion-refresher>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<template v-else-if="info">
				<ion-list v-for="sec in sections" :key="sec.title" class="scr_list" lines="full">
					<ion-list-header>{{ tr(sec.title) }}</ion-list-header>
					<ion-item v-for="f in sec.fields" :key="f">
						<ion-label class="ion-text-wrap"><p>{{ tr(f) }}</p><h2>{{ value(f) }}</h2></ion-label>
					</ion-item>
				</ion-list>
				<ion-list class="scr_list" lines="none">
					<ion-list-header>{{ tr("SEC_INVOICE_TERMS") }}</ion-list-header>
					<ion-item>
						<div v-if="info.invoiceTerms" v-safe-html="info.invoiceTerms" class="adm_terms" />
						<ion-label v-else>—</ion-label>
					</ion-item>
				</ion-list>
			</template>
			<bm-empty-state v-else :description="'ADM30000.NOT_FOUND'" />
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import type { RefresherCustomEvent } from "@ionic/vue";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { ADM30000Store } from "@/store/POS/ADM/ADM30000Store";
import type { StoreInfo } from "@/models/POS/ADM/ADM30000";

/** ADM30000 — store information (read-only); invoice terms render as sanitized HTML. */
defineOptions({ name: "ADM30000" });

const { t } = useI18n();
const tr = (k: string) => t(`ADM30000.${k}`);
const router = useRouter();
const store = ADM30000Store();
const info = computed(() => store.info);

/** i18n key → StoreInfo field, grouped as on the web. */
const FIELD: Record<string, keyof StoreInfo> = {
	CODE: "companyCode", NAME: "companyName", LEGAL_NAME: "legalName", TAX_ID: "taxId",
	EMAIL: "email", PHONE: "phone", ADDRESS: "address", CITY: "city", STATE: "state", POSTAL_CODE: "postalCode", COUNTRY: "country",
	SUBDOMAIN: "subdomain", CURRENCY: "currency"
};
const sections = [
	{ title: "SEC_IDENTITY", fields: ["CODE", "NAME", "LEGAL_NAME", "TAX_ID"] },
	{ title: "SEC_CONTACT", fields: ["EMAIL", "PHONE", "ADDRESS", "CITY", "STATE", "POSTAL_CODE", "COUNTRY"] },
	{ title: "SEC_SYSTEM", fields: ["SUBDOMAIN", "CURRENCY"] }
];
const value = (k: string) => info.value?.[FIELD[k]] || "—";

// Reload on every visit so an ADM31000 save shows up.
useViewEnter(() => store.load());
async function onRefresh(ev: RefresherCustomEvent): Promise<void> { store.load(); await ev.target.complete(); }
</script>

<style scoped>
ion-list-header { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
ion-label h2 { font-size: 14px; }
.adm_terms { font-size: 14px; line-height: 1.6; padding: 8px 0; }
.adm_terms :deep(ul) { list-style: disc; padding-left: 16px; }
.adm_terms :deep(ol) { list-style: decimal; padding-left: 16px; }
.adm_terms :deep(p) { margin: 0 0 4px; }
</style>
