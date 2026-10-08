<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu" />
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<ion-list v-else class="scr_list" lines="full">
				<ion-item><NumberInput v-model="store.form.totalFloors" :label="tr('TOTAL_FLOORS')" label-placement="stacked" integer min="1" /></ion-item>
				<ion-item><ion-toggle v-model="store.form.hasTableNumber">{{ tr("HAS_TABLE") }}</ion-toggle></ion-item>
				<ion-item v-if="store.form.hasTableNumber"><NumberInput v-model="store.form.totalTables" :label="tr('TOTAL_TABLES')" label-placement="stacked" integer min="0" /></ion-item>
				<ion-item><ion-toggle v-model="store.form.enableSequenceOrdering">{{ tr("SEQUENCE") }}</ion-toggle></ion-item>
				<ion-item v-if="store.form.enableSequenceOrdering"><NumberInput v-model="store.form.sequenceNumber" :label="tr('SEQUENCE_NO')" label-placement="stacked" integer min="0" /></ion-item>
				<ion-item><ion-toggle v-model="store.form.enablePrinting">{{ tr("PRINTING") }}</ion-toggle></ion-item>
				<ion-item><ion-textarea v-model="store.form.notes" :label="tr('NOTES')" label-placement="stacked" :rows="3" :auto-grow="true" /></ion-item>
			</ion-list>
		</ion-content>
		<ion-footer>
			<ion-toolbar>
				<div class="adm_btns">
					<ion-button expand="block" :disabled="store.saving || store.loading" @click="save">{{ tr("SAVE") }}</ion-button>
				</div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import NumberInput from "@/core/components/NumberInput.vue";
import { useI18n } from "vue-i18n";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { ADM40000Store } from "@/store/POS/ADM/ADM40000Store";

/** ADM40000 — store operation settings (floors, tables, sequence, printing), saved in place. */
defineOptions({ name: "ADM40000" });

const { t } = useI18n();
const tr = (k: string) => t(`ADM40000.${k}`);
const store = ADM40000Store();

useViewEnter(() => store.load());
function save(): void {
	store.save({ savedTitle: tr("SAVED"), savedMsg: tr("SAVED_MSG"), failedTitle: tr("FAILED") });
}
</script>

<style scoped>
.adm_btns { display: flex; padding: 8px 16px; }
.adm_btns ion-button { flex: 1; }
</style>
