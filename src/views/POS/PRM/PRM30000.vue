<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu" />
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<template v-else>
				<ion-list class="scr_list" lines="full">
					<ion-item>
						<ion-select v-model="store.form.currency" :label="`${tr('CURRENCY')} *`" label-placement="stacked" interface="action-sheet">
							<ion-select-option value="USD">USD</ion-select-option>
							<ion-select-option value="KHR">KHR</ion-select-option>
						</ion-select>
					</ion-item>
					<ion-item>
						<ion-input v-model.number="store.form.exchangeRate" :label="tr('EXCHANGE_RATE')" label-placement="stacked" type="number" inputmode="decimal" min="0" step="1" />
					</ion-item>
				</ion-list>
				<p class="prm_hint">{{ tr("RULES_MOVED") }}</p>
			</template>
		</ion-content>
		<ion-footer>
			<ion-toolbar>
				<ion-button expand="block" class="prm_save" :disabled="store.saving || store.loading" @click="onSave">{{ tr("SAVE") }}</ion-button>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { PRM30000Store } from "@/store/POS/PRM/PRM30000Store";

/** Payroll settings: currency + exchange rate (day rules live in ATD50000). */
defineOptions({ name: "PRM30000" });

const { t } = useI18n();
const tr = (k: string) => t(`PRM30000.${k}`);
const store = PRM30000Store();
useViewEnter(() => store.load());

function onSave(): void {
	store.save({ savedTitle: tr("SAVED"), savedMsg: tr("SAVED_MSG"), failTitle: tr("FAILED") });
}
</script>

<style scoped>
.prm_hint { font-size: 12px; color: var(--ion-color-medium); margin: 8px 16px; }
.prm_save { margin: 0 8px; }
</style>
