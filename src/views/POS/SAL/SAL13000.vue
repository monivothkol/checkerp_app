<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/SAL12000" />
		<ion-content>
			<bm-empty-state v-if="!store.draft" :description="'SAL13000.NO_DRAFT'" />
			<template v-else>
				<ion-list class="scr_list" lines="full">
					<ion-item><ion-label><p>{{ tr("CUSTOMER") }}</p><h3>{{ store.draft.display.customer }}</h3></ion-label></ion-item>
					<ion-item v-if="store.draft.display.phone"><ion-label><p>{{ tr("PHONE") }}</p><h3>{{ store.draft.display.phone }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("DATE") }}</p><h3>{{ store.draft.display.date }}</h3></ion-label></ion-item>
				</ion-list>
				<ion-list class="scr_list" lines="full">
					<ion-list-header>{{ tr("PRODUCT") }}</ion-list-header>
					<ion-item v-for="(l, i) in store.draft.display.lines" :key="i">
						<ion-label>
							<h3>{{ l.name }}</h3>
							<p>{{ l.code }}</p>
							<p>{{ tr("QTY") }} {{ l.qty }} × {{ money(l.price) }} · {{ tr("DISCOUNT") }} {{ money(l.discount) }}</p>
						</ion-label>
						<ion-note slot="end">{{ money(l.amount) }}</ion-note>
					</ion-item>
				</ion-list>
				<div class="sal_sums">
					<div><span>{{ tr("SUBTOTAL") }}</span><span>{{ money(store.draft.display.subTotal) }}</span></div>
					<div><span>{{ tr("LINE_DISCOUNT") }}</span><span>-{{ money(store.draft.display.discountTotal) }}</span></div>
					<div class="sal_total"><span>{{ tr("TOTAL") }}</span><strong>{{ money(store.draft.display.totalAmount) }}</strong></div>
				</div>
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
import { SAL13000Store } from "@/store/POS/SAL/SAL13000Store";

/** Quotation create step 2: review the draft and submit it (idempotent). */
defineOptions({ name: "SAL13000" });

const { t } = useI18n();
const tr = (k: string) => t(`SAL13000.${k}`);
const route = useRoute();
const router = useRouter();
const store = SAL13000Store();
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");

useViewEnter(() => { if (!store.loadDraft()) router.replace("/SAL12000"); });
// Only the visible instance follows the store's redirect.
watch(() => store.redirectTo, (to) => { if (to && route.path === "/SAL13000") router.replace(to); });
</script>

<style scoped>
.sal_sums { padding: 8px 16px; font-size: 14px; }
.sal_sums > div { display: flex; justify-content: space-between; padding: 2px 0; }
.sal_total { border-top: 1px solid var(--ion-color-light-shade); margin-top: 4px; padding-top: 8px !important; font-size: 16px; }
.sal_btns { --padding-start: 16px; --padding-end: 16px; }
.sal_btns ion-button { width: calc(50% - 4px); }
ion-label h3 { font-size: 14px; font-weight: 600; white-space: normal; }
ion-label p { font-size: 12px; }
</style>
