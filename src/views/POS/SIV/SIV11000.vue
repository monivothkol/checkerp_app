<template>
    <ion-page>
        <bm-header :title="tr('PAGE_TITLE')" default-href="/SIV10000" />
        <ion-content>
            <ion-list class="scr_list" lines="full">
                <ion-item>
                    <ion-select v-model="store.inventoryId" :label="tr('INVENTORY')" label-placement="stacked" interface="action-sheet" :placeholder="tr('SELECT')">
                        <ion-select-option v-for="i in store.inventories" :key="i.inventoryId" :value="i.inventoryId">{{ i.inventoryName }}</ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-list-header>{{ tr("SALE_TYPE") }}</ion-list-header>
                <ion-segment v-model="store.sellType" class="siv_seg">
                    <ion-segment-button value="retail"><ion-label>{{ tr("RETAIL") }}</ion-label></ion-segment-button>
                    <ion-segment-button value="wholesale"><ion-label>{{ tr("WHOLESALE") }}</ion-label></ion-segment-button>
                </ion-segment>
                <ion-item>
                    <ion-select :value="store.customerName" :label="tr('CUSTOMER')" label-placement="stacked" interface="action-sheet" :placeholder="tr('WALK_IN')" @ion-change="store.setCustomer($event.detail.value || undefined)">
                        <ion-select-option :value="''">{{ tr("WALK_IN") }}</ion-select-option>
                        <ion-select-option v-for="c in store.customers" :key="c.customerCode" :value="c.customerName">{{ c.customerName }}</ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-item>
                    <ion-select v-model="store.salePersonId" :label="tr('SALE_PERSON')" label-placement="stacked" interface="action-sheet" :placeholder="tr('SELECT')">
                        <ion-select-option :value="undefined">—</ion-select-option>
                        <ion-select-option v-for="s in store.salePersons" :key="s.salePersonId" :value="s.salePersonId">{{ s.name }}</ion-select-option>
                    </ion-select>
                </ion-item>
            </ion-list>

            <InvoiceLinesEditor :form="store" tr-key="SIV11000" @pick="onPickProduct" />

            <ion-list class="scr_list" lines="full">
                <ion-item><ion-textarea v-model="store.note" :label="tr('NOTE')" label-placement="stacked" auto-grow :rows="2" /></ion-item>
                <div class="siv_sum"><span>{{ tr("SUBTOTAL") }}</span><span>{{ money(store.subtotal) }}</span></div>
                <div class="siv_sum"><span>{{ tr("LINE_DISCOUNT") }}</span><span>-{{ money(store.lineDiscountTotal) }}</span></div>
                <ion-item><ion-input v-model.number="store.invoiceDiscount" :label="tr('INVOICE_DISCOUNT')" label-placement="stacked" type="number" inputmode="decimal" min="0" step="0.01" /></ion-item>
                <div class="siv_sum total"><span>{{ tr("TOTAL") }}</span><strong>{{ money(store.total) }}</strong></div>
                <ion-item>
                    <ion-select v-model="store.paymentMethodId" :label="tr('PAYMENT_METHOD')" label-placement="stacked" interface="action-sheet" :placeholder="tr('SELECT')">
                        <ion-select-option :value="undefined">—</ion-select-option>
                        <ion-select-option v-for="m in store.paymentMethods" :key="m.paymentMethodId" :value="m.paymentMethodId">{{ m.methodName }}</ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-item><ion-input v-model.number="store.paidAmount" :label="tr('PAID_AMOUNT')" label-placement="stacked" type="number" inputmode="decimal" min="0" step="0.01" /></ion-item>
                <div class="siv_sum"><span>{{ tr("BALANCE") }}</span><span>{{ money(store.balance) }}</span></div>
            </ion-list>
        </ion-content>
        <ion-footer>
            <ion-toolbar>
                <div class="siv_foot">
                    <ion-button fill="outline" @click="router.push('/SIV10000')">{{ tr("CANCEL") }}</ion-button>
                    <ion-button :disabled="!store.canConfirm" @click="confirm">{{ tr("CONFIRM") }}</ion-button>
                </div>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import UT from "@/core/utilities/ut";
import POP from "@/core/utilities/pop";
import VariantPickerModal from "@/views/POS/SAL/VariantPickerModal.vue";
import InvoiceLinesEditor from "@/views/POS/SIV/InvoiceLinesEditor.vue";
import { SIV11000Store } from "@/store/POS/SIV/SIV11000Store";
import type { SellableVariant } from "@/models/POS/SAL/SellableVariant";

/** Invoice create form (optionally prefilled from ?quotationNo=); Confirm stashes the draft → SIV12000. */
defineOptions({ name: "SIV11000" });

const { t } = useI18n();
const tr = (key: string) => t(`SIV11000.${key}`);
const route = useRoute();
const router = useRouter();
const store = SIV11000Store();
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");

onMounted(() => {
    store.loadLookups();
    const quotationNo = String(route.query.quotationNo ?? "");
    if (quotationNo) store.prefillFromQuotation(quotationNo);
});

/** A product with variants asks which one before the line is added. */
function onPickProduct(productId: string): void {
    const p = store.productResults.find((x) => x.productId === productId);
    if (!p?.hasVariants) { store.onPickProduct(productId); return; }
    store.productPick = undefined;
    POP.showPopup<SellableVariant>(VariantPickerModal, {
        title: `${t("POS10000.VARIANT_TITLE")} — ${p.productName}`,
        props: { productId, inventoryId: store.inventoryId }
    }).promise.then((res) => { if (res.data) store.onPickProduct(productId, res.data); }).catch(() => undefined);
}

function confirm(): void {
    if (store.buildAndSaveDraft(tr("WALK_IN"))) router.push("/SIV12000");
}
</script>

<style scoped>
ion-list-header { font-size: 14px; }
.siv_seg { margin: 0 16px 8px; width: auto; }
.siv_sum { display: flex; justify-content: space-between; padding: 8px 16px; font-size: 14px; }
.siv_sum.total { font-size: 16px; border-top: 2px solid var(--ion-color-light-shade, #e9e9ee); }
.siv_sum.total strong { color: var(--ion-color-primary); }
.siv_foot { display: flex; gap: 8px; padding: 4px 12px; }
.siv_foot ion-button { flex: 1; }
</style>
