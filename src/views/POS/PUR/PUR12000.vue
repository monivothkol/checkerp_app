<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/PUR11000" />
		<ion-content>
			<bm-empty-state v-if="!store.draft" description="PUR12000.NO_DRAFT" />
			<template v-else>
				<ion-list class="scr_list" lines="full">
					<ion-item><ion-label><p>{{ tr("SUPPLIER") }}</p><h3>{{ d.supplierName }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("INVENTORY") }}</p><h3>{{ d.inventoryName }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("ORDER_DATE") }}</p><h3>{{ d.orderDate }}</h3></ion-label></ion-item>
					<ion-item v-if="d.expectedDeliveryDate"><ion-label><p>{{ tr("EXPECTED_DATE") }}</p><h3>{{ d.expectedDeliveryDate }}</h3></ion-label></ion-item>
					<ion-item v-if="d.paymentTerm"><ion-label><p>{{ tr("PAYMENT_TERM") }}</p><h3>{{ d.paymentTerm }}</h3></ion-label></ion-item>
				</ion-list>
				<ion-list class="scr_list" lines="full">
					<ion-list-header>{{ tr("COL_PRODUCT") }}</ion-list-header>
					<ion-item v-for="(l, i) in d.lines" :key="i">
						<ion-label>
							<h3>{{ l.name }}<template v-if="l.variantName"> — {{ l.variantName }}</template></h3>
							<p>{{ l.code }}</p>
							<p>{{ tr("COL_QTY") }} {{ l.qty }} × {{ money(l.cost) }} · {{ tr("COL_TAX") }} {{ money(l.tax) }}</p>
						</ion-label>
						<ion-note slot="end">{{ money(l.amount) }}</ion-note>
					</ion-item>
				</ion-list>
				<div class="pur_sum">
					<div><span>{{ tr("SUBTOTAL") }}</span><span>{{ money(d.subTotal) }}</span></div>
					<div><span>{{ tr("DISCOUNT_TOTAL") }}</span><span>-{{ money(d.discountTotal) }}</span></div>
					<div><span>{{ tr("TAX_TOTAL") }}</span><span>{{ money(d.taxTotal) }}</span></div>
					<div class="total"><span>{{ tr("GRAND_TOTAL") }}</span><strong>{{ money(d.grandTotal) }}</strong></div>
				</div>
			</template>
		</ion-content>
		<ion-footer>
			<ion-toolbar>
				<div class="pur_btns">
					<ion-button fill="outline" :disabled="store.submitting" @click="router.push('/PUR11000')">{{ tr("BACK") }}</ion-button>
					<ion-button :disabled="!store.draft || store.submitting" @click="store.submit(tr('FAILED'))">{{ tr("CONFIRM") }}</ion-button>
				</div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { PUR12000Store } from "@/store/POS/PUR/PUR12000Store";
import type { PoDraftDisplay } from "@/models/POS/PUR/PUR11000";

/** Purchase-order confirm: review the PUR draft and submit (idempotent create). */
defineOptions({ name: "PUR12000" });

const { t } = useI18n();
const tr = (k: string) => t(`PUR12000.${k}`);
const router = useRouter();
const store = PUR12000Store();
const d = computed(() => store.draft?.display as PoDraftDisplay);
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");

watch(() => store.redirectTo, (to) => { if (to) router.replace(to); });
useViewEnter(() => { if (!store.loadDraft()) router.replace("/PUR11000"); });
</script>

<style scoped>
ion-label h3 { font-size: 14px; font-weight: 600; white-space: normal; }
ion-label p { font-size: 12px; }
.pur_sum { padding: 8px 16px; font-size: 14px; }
.pur_sum > div { display: flex; justify-content: space-between; padding: 4px 0; }
.pur_sum .total { font-size: 16px; border-top: 1px solid var(--ion-color-light-shade); padding-top: 8px; }
.pur_btns { display: flex; gap: 8px; padding: 8px 12px; }
.pur_btns ion-button { flex: 1; }
</style>
