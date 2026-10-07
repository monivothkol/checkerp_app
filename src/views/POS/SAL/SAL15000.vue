<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/SAL11000">
			<template v-if="store.detail && !store.loading" #end>
				<ion-button @click="openDocument"><ion-icon slot="icon-only" :icon="documentTextOutline" /></ion-button>
			</template>
		</bm-header>
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<template v-else-if="store.detail">
				<ion-list class="scr_list" lines="full">
					<ion-item>
						<ion-label><p>{{ code }}</p><h3>{{ store.detail.customerName || "—" }}</h3><p v-if="store.detail.phoneNo">{{ store.detail.phoneNo }}</p></ion-label>
						<ion-badge slot="end" :color="isActive ? 'success' : 'medium'">{{ store.detail.quotationStatusName || store.detail.quotationStatusCode || store.detail.status }}</ion-badge>
					</ion-item>
					<ion-item v-if="store.detail.inventoryName"><ion-label><p>{{ tr("INVENTORY") }}</p><h3>{{ store.detail.inventoryName }}</h3></ion-label></ion-item>
					<ion-item v-if="store.detail.quotationDate"><ion-label><p>{{ tr("DATE") }}</p><h3>{{ String(store.detail.quotationDate).slice(0, 10) }}</h3></ion-label></ion-item>
					<ion-item v-if="store.detail.remark"><ion-label><p>{{ tr("REMARK") }}</p><h3>{{ store.detail.remark }}</h3></ion-label></ion-item>
				</ion-list>
				<ion-list class="scr_list" lines="full">
					<ion-list-header>{{ tr("PRODUCT") }}</ion-list-header>
					<ion-item v-for="(it, i) in store.items" :key="i">
						<ion-label>
							<h3>{{ it.productName }}<template v-if="it.variantName"> — {{ it.variantName }}</template></h3>
							<p>{{ it.productCode }}</p>
							<p>{{ tr("QTY") }} {{ it.quantity }} × {{ money(it.unitPrice) }}<template v-if="Number(it.discountAmount)"> · {{ tr("DISCOUNT") }} {{ money(it.discountAmount) }}</template></p>
						</ion-label>
						<ion-note slot="end">{{ money(it.amount) }}</ion-note>
					</ion-item>
					<ion-item v-if="!store.items.length" lines="none"><ion-note>{{ tr("NO_LINES") }}</ion-note></ion-item>
				</ion-list>
				<div class="sal_sums">
					<div><span>{{ tr("SUBTOTAL") }}</span><span>{{ money(store.subTotal) }}</span></div>
					<div v-if="store.discountTotal"><span>{{ tr("DISCOUNT") }}</span><span>-{{ money(store.discountTotal) }}</span></div>
					<div class="sal_total"><span>{{ tr("TOTAL") }}</span><strong>{{ money(store.detail.totalAmount) }}</strong></div>
				</div>
			</template>
			<bm-empty-state v-else :description="'SAL15000.NOT_FOUND'" />
		</ion-content>
		<ion-footer v-if="store.detail && !store.loading && (isActive || store.detail.saleCode)">
			<ion-toolbar class="sal_btns">
				<template v-if="isActive">
					<ion-button fill="outline" @click="router.push(`/SAL17000?quotationNo=${encodeURIComponent(store.detail.quotationNo ?? '')}`)">{{ tr("EDIT") }}</ion-button>
					<ion-button @click="router.push(`/SIV11000?quotationNo=${encodeURIComponent(store.detail.quotationNo ?? '')}`)">{{ tr("CREATE_INVOICE") }}</ion-button>
				</template>
				<ion-button v-else expand="block" @click="router.push(`/SIV13000?saleCode=${encodeURIComponent(store.detail.saleCode ?? '')}`)">{{ tr("VIEW_INVOICE") }}</ion-button>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { documentTextOutline } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import QuotationDocument from "@/views/POS/COMMON/QuotationDocument.vue";
import { SAL15000Store } from "@/store/POS/SAL/SAL15000Store";

/** Quotation detail: ACTIVE → edit / create invoice; converted → view its invoice. */
defineOptions({ name: "SAL15000" });

const { t } = useI18n();
const tr = (k: string) => t(`SAL15000.${k}`);
const route = useRoute();
const router = useRouter();
const store = SAL15000Store();
const code = computed(() => String(route.query.quotationNo ?? ""));
const isActive = computed(() => store.detail?.quotationStatusCode === "ACTIVE");
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");

useViewEnter(() => store.load(code.value));

function openDocument(): void {
	if (!store.detail) return;
	POP.showPopup(QuotationDocument, { title: tr("PAGE_TITLE"), props: { quo: store.detail, items: store.items } }).promise.catch(() => undefined);
}
</script>

<style scoped>
.sal_sums { padding: 8px 16px; font-size: 14px; }
.sal_sums > div { display: flex; justify-content: space-between; padding: 2px 0; }
.sal_total { border-top: 1px solid var(--ion-color-light-shade); margin-top: 4px; padding-top: 8px !important; font-size: 16px; }
.sal_btns { --padding-start: 16px; --padding-end: 16px; }
.sal_btns ion-button { width: calc(50% - 4px); }
.sal_btns ion-button[expand="block"] { width: 100%; }
ion-label h3 { font-size: 14px; font-weight: 600; white-space: normal; }
ion-label p { font-size: 12px; }
</style>
