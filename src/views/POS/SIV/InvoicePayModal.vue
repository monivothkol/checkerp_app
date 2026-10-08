<template>
    <div>
        <div class="pay_summary">
            <div class="pay_row"><span>{{ tr("INVOICE") }}</span><span>{{ sale.saleCode }}</span></div>
            <div class="pay_row"><span>{{ tr("TOTAL") }}</span><span>{{ money(sale.totalAmount) }}</span></div>
            <div class="pay_row"><span>{{ tr("PAID") }}</span><span>{{ money(sale.paidAmount) }}</span></div>
            <div class="pay_row outstanding"><span>{{ tr("OUTSTANDING") }}</span><strong>{{ money(outstanding) }}</strong></div>
        </div>

        <ion-list class="scr_list" lines="full">
            <ion-item>
                <ion-select v-model="store.paymentMethodId" :label="`${tr('PAYMENT_METHOD')} *`" label-placement="stacked" interface="action-sheet" :placeholder="tr('SELECT')">
                    <ion-select-option v-for="m in store.paymentMethods" :key="m.paymentMethodId" :value="m.paymentMethodId">{{ m.methodName }}</ion-select-option>
                </ion-select>
            </ion-item>
            <ion-item><NumberInput v-model="amount" :label="`${tr('AMOUNT')} *`" label-placement="stacked" min="0.01" step="0.01" /></ion-item>
            <ion-item><NumberInput v-model="receivedAmount" :label="tr('RECEIVED')" label-placement="stacked" min="0" step="0.01" :placeholder="tr('RECEIVED_PH')" /></ion-item>
            <ion-item>
                <ion-checkbox :checked="payFull" @ion-change="amount = $event.detail.checked ? outstanding : null">{{ tr("PAY_FULL") }} ({{ money(outstanding) }})</ion-checkbox>
            </ion-item>
            <ion-item><ion-input v-model="referenceNumber" :label="tr('REFERENCE')" label-placement="stacked" :placeholder="tr('REFERENCE_PH')" clear-input /></ion-item>
            <ion-item><ion-textarea v-model="notes" :label="tr('NOTE')" label-placement="stacked" auto-grow :rows="2" /></ion-item>
        </ion-list>

        <div v-if="changeDue > 0" class="pay_change">{{ tr("CHANGE") }}: <strong>{{ money(changeDue) }}</strong></div>

        <div class="pay_btns">
            <ion-button fill="outline" :disabled="store.submitting" @click="emit('cancel')">{{ tr("CANCEL") }}</ion-button>
            <ion-button :disabled="!canPay" @click="submit">
                <ion-spinner v-if="store.submitting" name="crescent" />
                <template v-else>{{ tr("PAY") }}</template>
            </ion-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import NumberInput from "@/core/components/NumberInput.vue";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import UT from "@/core/utilities/ut";
import { SIV13100Store } from "@/store/POS/SIV/SIV13100Store";
import type { SaleRow } from "@/models/POS/SIV/SIV10000";
import type { SIV13100PayResponse } from "@/models/POS/SIV/SIV13100";

/** Record a payment against an invoice (SIV13100); defaults to the full outstanding amount. */
defineOptions({ name: "InvoicePayModal" });

const props = defineProps<{ sale: SaleRow }>();
const emit = defineEmits<{ ok: [SIV13100PayResponse]; cancel: [] }>();
const { t } = useI18n();
const tr = (key: string) => t(`SIV13100.${key}`);
const store = SIV13100Store();
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");

const outstanding = computed(() => Math.max(0,
    Number(props.sale.totalAmount ?? 0) - Number(props.sale.paidAmount ?? 0) - Number(props.sale.creditAppliedAmount ?? 0)));
const amount = ref<number | null>(outstanding.value);
const receivedAmount = ref<number | null>(null);
const referenceNumber = ref("");
const notes = ref("");

const payFull = computed(() => Number(amount.value ?? 0) >= outstanding.value);
/** The backend caps at outstanding; change = received − recorded amount. */
const changeDue = computed(() => Math.max(0, Number(receivedAmount.value ?? 0) - Math.min(Number(amount.value ?? 0), outstanding.value)));
const canPay = computed(() => !!store.paymentMethodId && Number(amount.value ?? 0) > 0 && !store.submitting);

onMounted(() => store.loadMethods());

async function submit(): Promise<void> {
    if (!canPay.value) return;
    const result = await store.submit({
        saleCode: props.sale.saleCode,
        paymentMethodId: store.paymentMethodId as string,
        amount: Number(amount.value ?? 0),
        receivedAmount: receivedAmount.value != null && String(receivedAmount.value) !== "" ? Number(receivedAmount.value) : undefined,
        referenceNumber: referenceNumber.value || undefined,
        notes: notes.value || undefined
    }, tr("PAY_FAILED"));
    if (result) emit("ok", result);
}
</script>

<style scoped>
.pay_summary { border: 1px solid var(--ion-color-light-shade, #e9e9ee); border-radius: 8px; padding: 12px; margin-bottom: 8px; }
.pay_row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; }
.pay_row.outstanding { border-top: 1px solid var(--ion-color-light-shade, #e9e9ee); margin-top: 8px; padding-top: 8px; font-size: 16px; }
.pay_row.outstanding strong { color: var(--ion-color-primary); }
.pay_change { padding: 8px 16px; font-size: 14px; color: var(--ion-color-success); }
.pay_btns { display: flex; gap: 8px; padding: 16px 0; }
.pay_btns ion-button { flex: 1; }
</style>
