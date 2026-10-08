<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu" />
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<template v-else>
				<ion-list class="scr_list" lines="full">
					<ion-list-header>{{ tr("SEC_PAYMENT") }}</ion-list-header>
					<ion-item v-for="k in paymentToggles" :key="k.field"><ion-toggle v-model="store.form[k.field]">{{ tr(k.label) }}</ion-toggle></ion-item>
				</ion-list>

				<ion-list class="scr_list" lines="full">
					<ion-list-header>{{ tr("SEC_CURRENCY") }}</ion-list-header>
					<ion-item>
						<ion-select v-model="store.form.primaryCurrency" :label="tr('PRIMARY_CURRENCY')" label-placement="stacked" interface="action-sheet">
							<ion-select-option value="USD">USD</ion-select-option><ion-select-option value="KHR">KHR</ion-select-option>
						</ion-select>
					</ion-item>
					<ion-item>
						<ion-select v-model="store.form.secondaryCurrency" :label="tr('SECONDARY_CURRENCY')" label-placement="stacked" interface="action-sheet">
							<ion-select-option value="USD">USD</ion-select-option><ion-select-option value="KHR">KHR</ion-select-option>
						</ion-select>
					</ion-item>
					<ion-item><NumberInput v-model="store.form.exchangeRate" :label="tr('EXCHANGE_RATE')" label-placement="stacked" min="0" step="0.0001" /></ion-item>
				</ion-list>

				<ion-list class="scr_list" lines="full">
					<ion-list-header>{{ tr("SEC_TAX") }}</ion-list-header>
					<ion-item>
						<ion-select v-model="store.form.defaultSalesTaxId" :label="tr('DEFAULT_SALES_TAX')" label-placement="stacked" :placeholder="tr('NO_TAX')" interface="action-sheet">
							<ion-select-option :value="null">{{ tr("NO_TAX") }}</ion-select-option>
							<ion-select-option v-for="x in store.salesTaxOptions" :key="x.taxId" :value="x.taxId">{{ x.taxName }} ({{ x.rate }}%)</ion-select-option>
						</ion-select>
					</ion-item>
					<ion-item>
						<ion-select v-model="store.form.defaultPurchaseTaxId" :label="tr('DEFAULT_PURCHASE_TAX')" label-placement="stacked" :placeholder="tr('NO_TAX')" interface="action-sheet">
							<ion-select-option :value="null">{{ tr("NO_TAX") }}</ion-select-option>
							<ion-select-option v-for="x in store.purchaseTaxOptions" :key="x.taxId" :value="x.taxId">{{ x.taxName }} ({{ x.rate }}%)</ion-select-option>
						</ion-select>
					</ion-item>
					<ion-item><ion-toggle v-model="store.form.pricesIncludeTax">{{ tr("PRICES_INCLUDE_TAX") }}</ion-toggle></ion-item>
				</ion-list>

				<ion-list class="scr_list" lines="full">
					<ion-list-header>{{ tr("SEC_INVOICE") }}</ion-list-header>
					<ion-item>
						<ion-select v-model="store.form.primaryProductIdentifier" :label="tr('PRODUCT_IDENTIFIER')" label-placement="stacked" interface="action-sheet">
							<ion-select-option value="PRODUCT_CODE">{{ tr("BY_CODE") }}</ion-select-option><ion-select-option value="BARCODE">{{ tr("BY_BARCODE") }}</ion-select-option>
						</ion-select>
					</ion-item>
					<ion-item>
						<ion-select v-model="store.form.invoiceInfoSource" :label="tr('INVOICE_INFO_SOURCE')" label-placement="stacked" interface="action-sheet">
							<ion-select-option value="STORE">{{ tr("INFO_STORE") }}</ion-select-option><ion-select-option value="BRANCH">{{ tr("INFO_BRANCH") }}</ion-select-option>
						</ion-select>
					</ion-item>
					<ion-item><ion-toggle v-model="store.form.useProductSecondaryCodeInInvoice">{{ tr("SECONDARY_CODE_INVOICE") }}</ion-toggle></ion-item>
				</ion-list>

				<ion-list class="scr_list" lines="full">
					<ion-list-header>{{ tr("SEC_CREDIT") }}</ion-list-header>
					<ion-item v-for="k in creditToggles" :key="k.field"><ion-toggle v-model="store.form[k.field]">{{ tr(k.label) }}</ion-toggle></ion-item>
				</ion-list>

				<!-- Credit policies (limit amounts & behaviour), merged in as on the web. -->
				<ion-list class="scr_list" lines="full">
					<ion-list-header>
						<ion-label>{{ tr("CREDIT_POLICIES") }}</ion-label>
						<ion-button size="small" @click="openPolicy(null)"><ion-icon slot="start" :icon="add" />{{ tr("ADD_POLICY") }}</ion-button>
					</ion-list-header>
					<ion-item lines="none"><ion-note class="adm_hint">{{ tr("POLICIES_HINT") }}</ion-note></ion-item>
					<ion-progress-bar v-if="policyStore.loading" type="indeterminate" />
					<ion-item v-for="r in policyStore.rows" :key="r.creditPolicyId" button :detail="true" @click="openPolicy(r)">
						<ion-label>
							<p class="adm_code">{{ r.code }}</p>
							<h2>{{ r.name }} <ion-badge v-if="r.isDefault" color="success">{{ polTr("DEFAULT") }}</ion-badge></h2>
							<p>{{ polTr("COL_LIMIT") }}: {{ money(r.creditLimit) }}</p>
							<p>{{ polTr("COL_TERM") }}: {{ r.creditTermDays ? `${r.creditTermDays} ${polTr("DAYS")}` : "—" }}</p>
							<p>{{ polTr("COL_MAX_OVERDUE") }}: {{ money(r.maxOverdueAmount) }}</p>
						</ion-label>
						<ion-badge slot="end" :color="r.isActive ? 'success' : 'medium'">{{ r.isActive ? polTr("ACTIVE") : polTr("INACTIVE") }}</ion-badge>
					</ion-item>
					<bm-empty-state v-if="!policyStore.loading && !policyStore.rows.length" />
				</ion-list>
			</template>
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
import { add } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { ADM50000Store } from "@/store/POS/ADM/ADM50000Store";
import { CRD10000Store } from "@/store/POS/CRD/CRD10000Store";
import CreditPolicyModal from "@/views/POS/CRD/CreditPolicyModal.vue";
import type { CreditPolicyRow } from "@/models/POS/CRD/CRD10000";

/** ADM50000 — sale settings (payment, currency, tax defaults, invoice, credit gates) + credit policies. */
defineOptions({ name: "ADM50000" });

type BoolField = "allowDelayedPayment" | "allowCustomPrice" | "customerPayVat" | "allowSellWithoutStock" | "allowDifferentSaleDate"
	| "allowDuplicateLineItems" | "enableCreditControl" | "creditGateLimit" | "creditGateOverdueAmount" | "creditGateOverdueDays";

const { t } = useI18n();
const tr = (k: string) => t(`ADM50000.${k}`);
const polTr = (k: string) => t(`CRD10000.${k}`);
const store = ADM50000Store();
const policyStore = CRD10000Store();

const paymentToggles: { field: BoolField; label: string }[] = [
	{ field: "allowDelayedPayment", label: "ALLOW_DELAYED" },
	{ field: "allowCustomPrice", label: "ALLOW_CUSTOM_PRICE" },
	{ field: "customerPayVat", label: "CUSTOMER_PAY_VAT" },
	{ field: "allowSellWithoutStock", label: "SELL_WITHOUT_STOCK" },
	{ field: "allowDifferentSaleDate", label: "DIFFERENT_SALE_DATE" },
	{ field: "allowDuplicateLineItems", label: "DUPLICATE_LINES" }
];
const creditToggles: { field: BoolField; label: string }[] = [
	{ field: "enableCreditControl", label: "ENABLE_CREDIT" },
	{ field: "creditGateLimit", label: "GATE_LIMIT" },
	{ field: "creditGateOverdueAmount", label: "GATE_OVERDUE_AMT" },
	{ field: "creditGateOverdueDays", label: "GATE_OVERDUE_DAYS" }
];

const money = (v: number | null | undefined) => (v == null ? polTr("UNLIMITED") : "$ " + Number(v).toFixed(2));

useViewEnter(() => {
	store.load();
	store.loadTaxes();
	policyStore.reload();
});

function openPolicy(policy: CreditPolicyRow | null): void {
	POP.showPopup(CreditPolicyModal, { title: policy ? polTr("EDIT_TITLE") : polTr("NEW_TITLE"), props: { policy } })
		.promise.catch(() => undefined); // the store reloads itself on success
}
function save(): void {
	store.save({ savedTitle: tr("SAVED"), savedMsg: tr("SAVED_MSG"), failedTitle: tr("FAILED") });
}
</script>

<style scoped>
.adm_btns { display: flex; padding: 8px 16px; }
.adm_btns ion-button { flex: 1; }
.adm_code { font-size: 10px; letter-spacing: .3px; }
.adm_hint { font-size: 12px; }
ion-list-header { font-size: 14px; font-weight: 600; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
