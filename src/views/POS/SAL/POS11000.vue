<template>
    <div class="ck">
        <ion-list class="scr_list ck_lines" lines="none">
            <ion-item v-for="(l, i) in store.cartLines" :key="i">
                <ion-label class="ck_line_name">{{ l.productName }} × {{ l.quantity }}</ion-label>
                <ion-note slot="end" class="ck_line_amt">
                    <s v-if="store.linePrice(l) !== (l.displayPrice ?? l.actualPrice)" class="ck_line_old">{{ usd((l.displayPrice ?? l.actualPrice) * l.quantity) }}</s>
                    {{ usd(store.linePrice(l) * l.quantity) }}
                </ion-note>
            </ion-item>
        </ion-list>
        <template v-if="store.taxTotal > 0">
            <div class="ck_sub"><span>{{ t("SUBTOTAL") }}</span><span>{{ fmt(store.displayNet, store.payCurrency) }}</span></div>
            <div class="ck_sub"><span>{{ t("TAX") }}<template v-if="store.tax.inclusive"> {{ t("TAX_INCLUDED") }}</template></span><span>{{ fmt(store.displayTax, store.payCurrency) }}</span></div>
        </template>
        <div class="ck_total"><span>{{ t("TOTAL") }}</span><strong>{{ fmt(store.displayTotal, store.payCurrency) }}</strong></div>

        <template v-if="!store.confirming">
            <ion-list class="scr_list" lines="full">
                <ion-item>
                    <ion-select v-model="store.inventoryId" :label="t('INVENTORY')" label-placement="stacked" interface="action-sheet" :placeholder="t('SELECT_INVENTORY')">
                        <ion-select-option v-for="inv in inventories" :key="inv.inventoryId" :value="inv.inventoryId">{{ inv.inventoryName }}</ion-select-option>
                    </ion-select>
                </ion-item>

                <ion-list-header>{{ t("CUSTOMER") }}</ion-list-header>
                <ion-segment :value="store.customerType" @ion-change="store.setCustomerType($event.detail.value as CustomerType)">
                    <ion-segment-button value="WALK_IN"><ion-label>{{ t("TYPE_WALK_IN") }}</ion-label></ion-segment-button>
                    <ion-segment-button value="ONLINE_ORDER"><ion-label>{{ t("TYPE_ONLINE") }}</ion-label></ion-segment-button>
                    <ion-segment-button value="MEMBERSHIP"><ion-label>{{ t("TYPE_MEMBERSHIP") }}</ion-label></ion-segment-button>
                </ion-segment>

                <!-- Membership: pick a saved customer (name/code/phone) → credit-checked -->
                <template v-if="store.customerType === 'MEMBERSHIP'">
                    <ion-searchbar :placeholder="t('SEARCH_MEMBER')" :debounce="0" @ion-input="store.searchCustomers(String($event.detail.value ?? ''))" />
                    <ion-progress-bar v-if="store.searchingCust" type="indeterminate" />
                    <ion-item v-for="c in store.custResults" :key="c.customerId" button :detail="false" @click="pickCustomer(c.customerId)">
                        <ion-label>{{ c.customerName }}<template v-if="c.customerCode"> · {{ c.customerCode }}</template></ion-label>
                    </ion-item>
                    <ion-item v-if="store.customerId">
                        <ion-label>
                            <p>{{ t("MEMBER") }}</p>
                            <h3>{{ store.customerName }}<span v-if="store.customerCode"> · {{ store.customerCode }}</span><span v-if="store.customerPhone"> · {{ store.customerPhone }}</span></h3>
                        </ion-label>
                    </ion-item>
                    <ion-item v-if="store.creditBlocked" color="danger" lines="none">
                        <ion-label class="ion-text-wrap">
                            <h3>{{ t("CREDIT_BLOCKED") }}</h3>
                            <p>{{ store.creditMessage }}</p>
                        </ion-label>
                    </ion-item>
                </template>

                <!-- Walk-in / online order: manual name + phone -->
                <template v-else>
                    <ion-item><ion-input v-model="store.customerName" :label="t('NAME')" label-placement="stacked" :placeholder="t('WALK_IN')" clear-input /></ion-item>
                    <ion-item><ion-input v-model="store.customerPhone" :label="t('PHONE')" label-placement="stacked" type="tel" inputmode="tel" clear-input /></ion-item>
                </template>

                <ion-list-header>{{ t("PAYMENT_METHOD") }}</ion-list-header>
                <ion-progress-bar v-if="store.loadingCtx" type="indeterminate" />
                <ion-segment v-else v-model="store.paymentMethodId" scrollable>
                    <ion-segment-button v-for="m in store.methods" :key="m.paymentMethodId" :value="m.paymentMethodId"><ion-label>{{ m.methodName }}</ion-label></ion-segment-button>
                </ion-segment>

                <!-- Currency toggle (cash in a dual-currency store) -->
                <template v-if="store.isCash && store.hasSecondary">
                    <ion-list-header>{{ t("CURRENCY") }}</ion-list-header>
                    <ion-segment v-model="store.payCurrency">
                        <ion-segment-button :value="store.primaryCurrency"><ion-label>{{ store.primaryCurrency }}</ion-label></ion-segment-button>
                        <ion-segment-button :value="store.secondaryCurrency"><ion-label>{{ store.secondaryCurrency }}</ion-label></ion-segment-button>
                    </ion-segment>
                </template>

                <!-- Amount received — every method except KHQR (exact via QR) -->
                <template v-if="!store.isKhqr">
                    <ion-item>
                        <NumberInput v-model="store.received" :label="t('RECEIVED')" label-placement="stacked" min="0" :step="store.inSecondary ? '100' : '0.01'" />
                    </ion-item>
                    <div v-if="Number(store.received) >= store.displayTotal" class="ck_change">{{ t("CHANGE") }}: <strong>{{ fmt(store.change, store.payCurrency) }}</strong></div>
                </template>

                <ion-item v-if="store.isBankTransfer">
                    <ion-select v-model="store.bankCode" :label="t('BANK')" label-placement="stacked" interface="action-sheet" :placeholder="t('SELECT_BANK')">
                        <ion-select-option v-for="b in store.banks" :key="b.bankCode" :value="b.bankCode">{{ b.shortName || b.bankName }}</ion-select-option>
                    </ion-select>
                </ion-item>

                <template v-if="store.isCheque">
                    <ion-item><ion-input v-model="store.chequeNumber" :label="t('CHEQUE_NO')" label-placement="stacked" clear-input /></ion-item>
                    <ion-item><ion-input v-model="store.chequeNote" :label="t('NOTE')" label-placement="stacked" clear-input /></ion-item>
                </template>
            </ion-list>

            <div class="ck_actions">
                <ion-button fill="outline" @click="emit('cancel')">{{ t("CANCEL") }}</ion-button>
                <ion-button :disabled="!store.canProcess" @click="onProcessClick">{{ store.isKhqr ? t("SHOW_QR") : t("PROCESS") }}</ion-button>
            </div>
        </template>

        <template v-else>
            <div class="ck_confirm">
                <ion-icon :icon="alertCircleOutline" class="ck_confirm_ico" />
                <p>{{ t("CONFIRM_MSG", { amount: fmt(store.displayTotal, store.payCurrency), method: store.selectedMethodName }) }}</p>
            </div>
            <div class="ck_actions">
                <ion-button fill="outline" :disabled="store.processing" @click="store.confirming = false">{{ t("BACK") }}</ion-button>
                <ion-button :disabled="store.processing" @click="store.submitSale(store.buildPayment(), t('FAILED'))">
                    <ion-spinner v-if="store.processing" name="crescent" />
                    <template v-else>{{ t("CHECKOUT_PAID") }}</template>
                </ion-button>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import NumberInput from "@/core/components/NumberInput.vue";
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { alertCircleOutline } from "ionicons/icons";
import UT from "@/core/utilities/ut";
import POP from "@/core/utilities/pop";
import DataStorage from "@/core/utilities/data-storage";
import KhqrPaymentModal from "@/views/POS/SAL/KhqrPaymentModal.vue";
import { POS11000Store, type CheckoutLine } from "@/store/POS/SAL/POS11000Store";

/** POS checkout popup body: customer, payment method/currency/received, confirm, KHQR → create sale. */
defineOptions({ name: "POS11000" });

type CustomerType = "WALK_IN" | "ONLINE_ORDER" | "MEMBERSHIP";

const props = defineProps<{ cartLines: CheckoutLine[]; subtotal: number; inventoryId?: string }>();
const emit = defineEmits<{ ok: [{ saleCode?: string }]; cancel: [] }>();
const { t: $t } = useI18n();
const t = (key: string, named?: Record<string, unknown>) => $t(`POS11000.${key}`, named ?? {});
const store = POS11000Store();

// Assigned staff may only sell from their inventories (server enforces it too); [] = unrestricted.
const assigned = ref<string[]>([]);
const inventories = computed(() => assigned.value.length
    ? store.inventories.filter((i) => assigned.value.includes(i.inventoryId))
    : store.inventories);

watch(() => store.paymentMethodId, () => store.onMethodChanged());
watch(() => store.payCurrency, () => store.onCurrencyChanged());
watch(() => store.saved, (v) => { if (v) emit("ok", { saleCode: store.savedSaleCode }); });

onMounted(async () => {
    store.init(props.cartLines, props.subtotal, props.inventoryId);
    void store.loadContext();
    void store.loadInventories();
    try {
        const raw = await DataStorage.get({ key: "userInfo" });
        const ids = raw ? (JSON.parse(raw) as { assignedInventoryIds?: unknown }).assignedInventoryIds : undefined;
        assigned.value = Array.isArray(ids) ? ids.map(String) : [];
    } catch {
        assigned.value = [];
    }
});

const usd = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");
function fmt(v: unknown, currencyCode: string): string {
    if (currencyCode && currencyCode !== store.primaryCurrency) return UT.currency((v as string | number) ?? 0, currencyCode) + " " + currencyCode;
    return usd(v);
}

function pickCustomer(id: string): void {
    store.onPickCustomer(id);
    store.custResults = [];
}

function onProcessClick(): void {
    if (store.isKhqr) openKhqr();
    else store.confirming = true;
}
function openKhqr(): void {
    POP.showPopup<{ transactionId?: string; manual?: boolean }>(KhqrPaymentModal, {
        title: "KHQR",
        props: { amount: store.total, customerName: store.customerName, billNumber: "" }
    }).promise
        .then((res) => store.submitSale(store.buildKhqrPayment(res?.data?.transactionId, res?.data?.manual), t("FAILED")))
        .catch(() => undefined); // QR cancelled — stay on checkout
}
</script>

<style scoped>
.ck_lines { max-height: 200px; overflow-y: auto; border: 1px solid var(--ion-color-light-shade, #e9e9ee); border-radius: 8px; margin: 0 0 8px; }
.ck_lines ion-item { --min-height: 32px; font-size: 14px; }
.ck_line_amt { font-size: 14px; font-weight: 600; color: inherit; }
.ck_line_old { color: var(--ion-color-medium); margin-right: 8px; font-weight: 400; }
.ck_sub { display: flex; justify-content: space-between; padding: 2px 4px; font-size: 12px; color: var(--ion-color-medium); }
.ck_total { display: flex; justify-content: space-between; align-items: center; padding: 12px 4px; font-size: 16px; }
.ck_total strong { color: var(--ion-color-primary); }
ion-list-header { font-size: 14px; }
ion-segment { margin: 0 16px 8px; width: auto; }
ion-segment-button { font-size: 12px; min-width: auto; }
.ck_change { text-align: right; font-size: 14px; color: var(--ion-color-medium); padding: 4px 16px; }
.ck_actions { display: flex; gap: 8px; padding: 16px 0; }
.ck_actions ion-button { flex: 1; }
.ck_confirm { text-align: center; padding: 16px 8px 8px; font-size: 16px; }
.ck_confirm_ico { width: 32px; height: 32px; color: var(--ion-color-warning); }
</style>
