<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/PRM21000" />
		<ion-content>
			<bm-empty-state v-if="!store.draft" description="PRM22000.NO_DRAFT" />
			<ion-list v-else class="scr_list" lines="full">
				<ion-item><ion-label><p>{{ tr("STAFF") }}</p><h3>{{ store.draft.display.staffName }}</h3></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("TYPE") }}</p><h3>{{ store.draft.display.typeName }}</h3></ion-label></ion-item>
				<ion-item>
					<ion-label><p>{{ tr("CATEGORY") }}</p></ion-label>
					<ion-badge slot="end" :color="store.draft.display.category === 'EARNING' ? 'success' : 'danger'">{{ tr("CAT_" + store.draft.display.category) }}</ion-badge>
				</ion-item>
				<ion-item><ion-label><p>{{ tr("AMOUNT") }}</p><h3>$ {{ UT.currency(store.draft.display.amount, "USD") }}</h3></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("MONTH") }}</p><h3>{{ store.draft.display.month }}</h3></ion-label></ion-item>
				<ion-item v-if="store.draft.display.remark"><ion-label class="ion-text-wrap"><p>{{ tr("REMARK") }}</p><h3>{{ store.draft.display.remark }}</h3></ion-label></ion-item>
			</ion-list>
		</ion-content>
		<ion-footer>
			<ion-toolbar>
				<div class="prm_btns">
					<ion-button fill="outline" :disabled="store.submitting" @click="router.push('/PRM21000')">{{ tr("BACK") }}</ion-button>
					<ion-button :disabled="store.submitting || !store.draft" @click="store.submit(tr('FAILED'))">{{ tr("CONFIRM") }}</ion-button>
				</div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { PRM22000Store } from "@/store/POS/PRM/PRM22000Store";

/** New payroll adjustment, step 2: review the draft and save it (idempotent). */
defineOptions({ name: "PRM22000" });

const { t } = useI18n();
const router = useRouter();
const tr = (k: string) => t(`PRM22000.${k}`);
const store = PRM22000Store();

watch(() => store.redirectTo, (to) => { if (to) router.replace(to); });
useViewEnter(() => { if (!store.loadDraft()) router.replace("/PRM21000"); });
</script>

<style scoped>
ion-label h3 { font-size: 14px; }
.prm_btns { display: flex; gap: 8px; padding: 0 8px; }
.prm_btns ion-button { flex: 1; }
</style>
