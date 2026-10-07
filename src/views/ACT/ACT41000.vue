<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu" />
		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<ion-note class="act_hint">{{ tr("HINT") }}</ion-note>
			<ion-list class="scr_list" lines="full">
				<ion-item v-for="r in store.rows" :key="r.paymentMethodId">
					<ion-select v-model="r.accountCode" label-placement="stacked" interface="action-sheet" :interface-options="{ header: r.methodName }">
						<div slot="label"><b>{{ r.methodName }}</b> <span class="act_muted">{{ r.methodCode }}</span></div>
						<ion-select-option value="">{{ tr("DEFAULT_ROUTING") }}</ion-select-option>
						<ion-select-option v-for="a in store.accounts" :key="a.accountCode" :value="a.accountCode">{{ a.accountCode }} — {{ a.accountName }}</ion-select-option>
					</ion-select>
				</ion-item>
				<ion-item v-if="!store.loading && !store.rows.length"><ion-label class="act_muted">{{ tr("NO_METHODS") }}</ion-label></ion-item>
			</ion-list>
		</ion-content>
		<ion-footer>
			<ion-toolbar>
				<div class="act_btns"><ion-button :disabled="store.saving" @click="onSave">{{ tr("SAVE") }}</ion-button></div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { RefresherCustomEvent } from "@ionic/vue";
import POP from "@/core/utilities/pop";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { ACT41000Store } from "@/store/ACT/ACT41000Store";

/** Payment mapping: route each payment method to a cash/bank account (blank = default routing). */
defineOptions({ name: "ACT41000" });

const { t } = useI18n();
const tr = (k: string) => t(`ACT41000.${k}`);
const store = ACT41000Store();

useViewEnter(() => store.load());
async function onRefresh(ev: RefresherCustomEvent): Promise<void> {
	store.load();
	await ev.target.complete();
}
function onSave(): void {
	store.save(tr("SAVE_FAILED"), () => POP.alert({ status: "success", title: tr("SAVED"), content: tr("SAVED_MSG") }));
}
</script>

<style scoped src="./act-report.css"></style>
<style scoped>
ion-select { font-size: 14px; }
.act_hint { padding-bottom: 8px; }
</style>
