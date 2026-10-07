<template>
	<div>
		<div class="ppay_sum">
			<div><span>{{ tr("PURCHASE_IN") }}</span><span>{{ adjustmentCode }}</span></div>
			<div class="out"><span>{{ tr("OUTSTANDING") }}</span><strong>{{ money(outstanding) }}</strong></div>
		</div>
		<ion-list class="scr_list" lines="full">
			<ion-item>
				<ion-select v-model="paymentMethodId" :label="`${tr('PAYMENT_METHOD')} *`" label-placement="stacked" :placeholder="tr('SELECT')" interface="action-sheet">
					<ion-select-option v-for="m in paymentMethods" :key="m.paymentMethodId" :value="m.paymentMethodId">{{ m.methodName }}</ion-select-option>
				</ion-select>
			</ion-item>
			<ion-item>
				<ion-input v-model.number="amount" type="number" inputmode="decimal" min="0.01" :max="outstanding" step="0.01" :label="`${tr('AMOUNT')} *`" label-placement="stacked" />
			</ion-item>
			<ion-item>
				<ion-input v-model="referenceNumber" :label="tr('REFERENCE')" label-placement="stacked" :placeholder="tr('REFERENCE_PH')" clear-input />
			</ion-item>
			<ion-item>
				<ion-textarea v-model="notes" :label="tr('NOTE')" label-placement="stacked" auto-grow :rows="2" />
			</ion-item>
		</ion-list>
		<div class="ppay_btns">
			<ion-button fill="outline" :disabled="submitting" @click="emit('cancel')">{{ tr("CANCEL") }}</ion-button>
			<ion-button :disabled="!canPay || submitting" @click="submit">{{ tr("PAY") }}</ion-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import UT from "@/core/utilities/ut";
import POP from "@/core/utilities/pop";
import PayPurchaseIn from "@/services/api/PUR/payPurchaseIn";
import type { PaymentMethodLookup } from "@/models/POS/COMMON/lookups";

/** Pay the supplier against a received purchase-in (amount ≤ outstanding, idempotent). */
defineOptions({ name: "PurchasePayModal" });

const props = withDefaults(defineProps<{ adjustmentId: string; adjustmentCode?: string; outstanding: number; paymentMethods?: PaymentMethodLookup[] }>(),
	{ adjustmentCode: "", paymentMethods: () => [] });
const emit = defineEmits<{ ok: []; cancel: [] }>();
const { t } = useI18n();
const tr = (k: string) => t(`PUR24000.${k}`);
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");

const amount = ref<number>(props.outstanding);
const paymentMethodId = ref<string | undefined>();
const referenceNumber = ref("");
const notes = ref("");
const submitting = ref(false);
const canPay = computed(() => !!paymentMethodId.value && Number(amount.value) > 0 && Number(amount.value) <= props.outstanding);

function submit(): void {
	if (!canPay.value || submitting.value) return;
	submitting.value = true;
	PayPurchaseIn.getInstance().request({
		dataBody: {
			adjustmentId: props.adjustmentId,
			amount: Number(amount.value),
			paymentMethodId: paymentMethodId.value as string,
			referenceNumber: referenceNumber.value.trim() || undefined,
			notes: notes.value.trim() || undefined
		},
		headers: { "Idempotency-Key": crypto.randomUUID() },
		listener: {
			onSuccess: () => { submitting.value = false; emit("ok"); },
			onFail: (err) => {
				submitting.value = false;
				POP.alert({ title: tr("PAY_FAILED"), status: "error", content: err?.message, errorCode: err?.code });
			}
		}
	});
}
</script>

<style scoped>
.ppay_sum { background: var(--ion-color-light); border-radius: 8px; padding: 12px; font-size: 14px; }
.ppay_sum > div { display: flex; justify-content: space-between; padding: 2px 0; }
.ppay_sum .out { font-size: 16px; padding-top: 8px; }
.ppay_btns { display: flex; gap: 8px; padding: 16px 0; }
.ppay_btns ion-button { flex: 1; }
</style>
