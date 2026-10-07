<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/SAL21000" />
		<ion-content>
			<bm-empty-state v-if="!store.draft" :description="'SAL22000.NO_DRAFT'" />
			<template v-else>
				<ion-list class="scr_list" lines="full">
					<ion-item><ion-label><p>{{ tr("SALE_CODE") }}</p><h3>{{ store.draft.display.saleCode }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("CUSTOMER") }}</p><h3>{{ store.draft.display.customerName || "—" }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("TOTAL_REFUND") }}</p><h3><strong>{{ money(store.draft.display.totalRefund) }}</strong></h3></ion-label></ion-item>
				</ion-list>
				<ion-list class="scr_list" lines="full">
					<ion-list-header>{{ tr("COL_PRODUCT") }}</ion-list-header>
					<ion-item v-for="(l, i) in store.draft.display.lines" :key="i">
						<ion-label><h3>{{ l.name }}</h3><p>{{ l.code }} · {{ tr("COL_QTY") }} {{ l.qty }}</p></ion-label>
						<ion-note slot="end">{{ money(l.refund) }}</ion-note>
					</ion-item>
				</ion-list>
				<p class="sal_est">{{ tr("ESTIMATE_NOTE") }}</p>
			</template>
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
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { SAL22000Store } from "@/store/POS/SAL/SAL22000Store";

/** Sale-return create step 2: review and submit (idempotent). */
defineOptions({ name: "SAL22000" });

const { t } = useI18n();
const tr = (k: string) => t(`SAL22000.${k}`);
const route = useRoute();
const router = useRouter();
const store = SAL22000Store();
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");

useViewEnter(() => { if (!store.loadDraft()) router.replace("/SAL21000"); });
watch(() => store.redirectTo, (to) => { if (to && route.path === "/SAL22000") router.replace(to); });
</script>

<style scoped>
.sal_est { font-size: 12px; color: var(--ion-color-medium); padding: 0 16px; }
.sal_btns { --padding-start: 16px; --padding-end: 16px; }
.sal_btns ion-button { width: calc(50% - 4px); }
ion-label h3 { font-size: 14px; font-weight: 600; white-space: normal; }
ion-label p { font-size: 12px; }
</style>
