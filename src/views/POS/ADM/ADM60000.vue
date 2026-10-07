<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template v-if="info?.exists" #end>
				<ion-button @click="router.push('/ADM61000')">{{ tr("EDIT") }}</ion-button>
			</template>
		</bm-header>
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<div v-else-if="!info || !info.exists" class="adm_empty">
				<bm-empty-state :description="'ADM60000.NOT_CONFIGURED'" />
				<ion-button @click="router.push('/ADM61000')">{{ tr("CONFIGURE") }}</ion-button>
			</div>
			<ion-list v-else class="scr_list" lines="full">
				<ion-item v-for="r in rowsShown" :key="r.key">
					<ion-label class="ion-text-wrap"><p>{{ tr(r.key) }}</p><h2 :class="{ adm_code: r.key === 'ACCOUNT' }">{{ r.value }}</h2></ion-label>
				</ion-item>
			</ion-list>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { ADM60000Store } from "@/store/POS/ADM/ADM60000Store";

/** ADM60000 — Bakong (KHQR) merchant configuration, read-only. */
defineOptions({ name: "ADM60000" });

const { t } = useI18n();
const tr = (k: string) => t(`ADM60000.${k}`);
const router = useRouter();
const store = ADM60000Store();
const info = computed(() => store.info);

const currencyLabel = (v?: string) => (v === "116" ? "KHR (116)" : "USD (840)");
/** Required rows always show; optional ones only when set (as on the web). */
const rowsShown = computed(() => {
	const i = info.value ?? {};
	return [
		{ key: "ACCOUNT", value: i.bakongAccountId, always: true },
		{ key: "TYPE", value: i.merchantType, always: true },
		{ key: "MERCHANT_NAME", value: i.merchantName, always: true },
		{ key: "CITY", value: i.merchantCity, always: true },
		{ key: "MERCHANT_ID", value: i.merchantId },
		{ key: "BANK", value: i.acquiringBank },
		{ key: "CURRENCY", value: currencyLabel(i.defaultCurrency), always: true },
		{ key: "MCC", value: i.merchantCategoryCode },
		{ key: "STORE_LABEL", value: i.storeLabel },
		{ key: "TERMINAL_LABEL", value: i.terminalLabel },
		{ key: "MOBILE", value: i.mobileNumber }
	].filter((r) => r.always || r.value);
});

useViewEnter(() => store.load());
</script>

<style scoped>
.adm_empty { text-align: center; padding-bottom: 16px; }
.adm_code { font-family: monospace; }
ion-label p { font-size: 12px; }
ion-label h2 { font-size: 14px; }
</style>
