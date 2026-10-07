<template>
	<div>
		<ion-note class="lrm_note">{{ tr("REPAY_HINT", { outstanding: money(store.detail?.outstanding) }) }}</ion-note>
		<ion-list class="scr_list" lines="full">
			<ion-item><ion-input v-model="store.paymentDate" type="date" :label="`${tr('PAYMENT_DATE')} *`" label-placement="stacked" /></ion-item>
			<ion-item>
				<ion-select v-model="store.paidFrom" :label="tr('PAID_FROM')" label-placement="stacked" interface="action-sheet">
					<ion-select-option v-for="v in ACCOUNTS" :key="v" :value="v">{{ $t(`DBT20000.${v}`) }}</ion-select-option>
				</ion-select>
			</ion-item>
			<ion-item>
				<ion-input :value="store.principalAmount" type="number" inputmode="decimal" min="0" step="0.01" :label="tr('PRINCIPAL_AMOUNT')" label-placement="stacked"
					@ion-input="store.principalAmount = num($event.detail.value)" />
			</ion-item>
			<ion-item>
				<ion-input :value="store.interestAmount" type="number" inputmode="decimal" min="0" step="0.01" :label="tr('INTEREST_AMOUNT')" label-placement="stacked"
					@ion-input="store.interestAmount = num($event.detail.value)" />
			</ion-item>
			<ion-item><ion-input v-model="store.referenceNo" :label="tr('REFERENCE')" label-placement="stacked" :clear-input="true" /></ion-item>
		</ion-list>
		<p class="lrm_note">{{ tr("TOTAL") }}: <b>{{ money(Number(store.principalAmount ?? 0) + Number(store.interestAmount ?? 0)) }}</b></p>
		<div class="lrm_btns">
			<ion-button fill="outline" @click="emit('cancel')">{{ tr("CANCEL") }}</ion-button>
			<ion-button :disabled="store.submitting" @click="onSubmit">{{ tr("RECORD_PAYMENT") }}</ion-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import UT from "@/core/utilities/ut";
import POP from "@/core/utilities/pop";
import { DBT30000Store } from "@/store/POS/DBT/DBT30000Store";

/** Repayment sheet for DBT30000 (POP.showPopup body), pre-filled with the next unpaid instalment; emits ok / cancel. */
defineOptions({ name: "LoanRepaymentModal" });

const ACCOUNTS = ["CASH", "BANK"];
const emit = defineEmits<{ ok: []; cancel: [] }>();
const { t } = useI18n();
const tr = (k: string, args: Record<string, unknown> = {}) => t(`DBT30000.${k}`, args);
const store = DBT30000Store();
const money = (v: unknown) => "$ " + UT.currency(Number(v ?? 0), "USD");
const num = (v?: string | null) => (v === "" || v == null ? undefined : Number(v));

onMounted(() => store.resetRepayment());

function onSubmit(): void {
	const total = Number(store.principalAmount ?? 0) + Number(store.interestAmount ?? 0);
	if (!store.paymentDate || total <= 0) {
		POP.alert({ status: "error", title: tr("VALIDATION"), content: tr("REQUIRED_MSG") });
		return;
	}
	store.repay((ok, _res, error) => {
		if (ok) {
			emit("ok");
		} else {
			const e = error as { message?: string; code?: string } | undefined;
			POP.alert({ status: "error", title: tr("REPAY_FAILED"), content: e?.message, errorCode: e?.code });
		}
	});
}
</script>

<style scoped>
.lrm_note { display: block; margin: 0 0 12px; font-size: 12px; color: #6b6b76; }
.lrm_btns { display: flex; gap: 8px; padding: 16px 0; }
.lrm_btns ion-button { flex: 1; }
</style>
