<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/ADM60000" />
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<ion-list v-else class="scr_list" lines="full">
				<ion-item><ion-input v-model="store.form.bakongAccountId" :label="`${tr('ACCOUNT')} *`" label-placement="stacked" placeholder="name@bank" autocapitalize="off" /></ion-item>
				<ion-item>
					<ion-select v-model="store.form.merchantType" :label="`${tr('TYPE')} *`" label-placement="stacked" interface="action-sheet">
						<ion-select-option value="INDIVIDUAL">INDIVIDUAL</ion-select-option><ion-select-option value="MERCHANT">MERCHANT</ion-select-option>
					</ion-select>
				</ion-item>
				<ion-item><ion-input v-model="store.form.merchantName" :label="`${tr('MERCHANT_NAME')} *`" label-placement="stacked" :maxlength="25" /></ion-item>
				<ion-item><ion-input v-model="store.form.merchantCity" :label="`${tr('CITY')} *`" label-placement="stacked" :maxlength="15" /></ion-item>
				<ion-item><ion-input v-model="store.form.merchantId" :label="tr('MERCHANT_ID')" label-placement="stacked" /></ion-item>
				<ion-item><ion-input v-model="store.form.acquiringBank" :label="tr('BANK')" label-placement="stacked" /></ion-item>
				<ion-item>
					<ion-select v-model="store.form.defaultCurrency" :label="`${tr('CURRENCY')} *`" label-placement="stacked" interface="action-sheet">
						<ion-select-option value="840">USD (840)</ion-select-option><ion-select-option value="116">KHR (116)</ion-select-option>
					</ion-select>
				</ion-item>
				<ion-item><ion-input v-model="store.form.merchantCategoryCode" :label="tr('MCC')" label-placement="stacked" placeholder="5999" inputmode="numeric" /></ion-item>
				<ion-item><ion-input v-model="store.form.storeLabel" :label="tr('STORE_LABEL')" label-placement="stacked" :maxlength="25" /></ion-item>
				<ion-item><ion-input v-model="store.form.terminalLabel" :label="tr('TERMINAL_LABEL')" label-placement="stacked" :maxlength="25" /></ion-item>
				<ion-item><ion-input v-model="store.form.mobileNumber" :label="tr('MOBILE')" label-placement="stacked" type="tel" inputmode="tel" :maxlength="25" /></ion-item>
			</ion-list>
		</ion-content>
		<ion-footer>
			<ion-toolbar>
				<div class="adm_btns">
					<ion-button fill="outline" @click="router.push('/ADM60000')">{{ tr("CANCEL") }}</ion-button>
					<ion-button :disabled="store.saving || !store.canSave" @click="save">{{ tr("SAVE") }}</ion-button>
				</div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { ADM61000Store } from "@/store/POS/ADM/ADM61000Store";

/** ADM61000 — edit Bakong merchant configuration. */
defineOptions({ name: "ADM61000" });

const { t } = useI18n();
const tr = (k: string) => t(`ADM61000.${k}`);
const router = useRouter();
const store = ADM61000Store();

watch(() => store.redirectTo, (to) => { if (to) router.push(to); });
useViewEnter(() => store.load());

function save(): void {
	store.save({ savedTitle: tr("SAVED"), savedMsg: tr("SAVED_MSG"), failedTitle: tr("FAILED") });
}
</script>

<style scoped>
.adm_btns { display: flex; gap: 8px; padding: 8px 16px; }
.adm_btns ion-button { flex: 1; }
</style>
