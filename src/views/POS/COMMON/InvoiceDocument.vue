<template>
    <div class="inv-wrap">
        <div v-if="canPrint" class="inv-toolbar">
            <ion-button size="small" @click="printInvoice">{{ t("PRINT_A4") }}</ion-button>
            <ion-button size="small" fill="outline" @click="printReceipt">{{ t("PRINT_80MM") }}</ion-button>
        </div>

        <div class="inv-doc" :class="{ 'inv-print-target': mode === 'a4' }">
            <div class="inv-card">
                <div class="inv-header">
                    <div>
                        <div class="inv-store-name">{{ store.name || "—" }}</div>
                        <div v-if="store.address" class="inv-store-line">{{ store.address }}</div>
                        <div v-if="store.phone" class="inv-store-line">Tel: {{ store.phone }}</div>
                        <div v-if="store.email" class="inv-store-line">{{ store.email }}</div>
                        <div v-if="store.taxId" class="inv-store-line">VAT TIN: {{ store.taxId }}</div>
                    </div>
                    <div class="inv-title">
                        <h1>INVOICE</h1>
                        <div class="inv-code">{{ invoice.saleCode }}</div>
                    </div>
                </div>

                <div class="inv-info">
                    <div class="inv-box">
                        <div class="inv-box-title">{{ t("BILL_TO") }}</div>
                        <div class="inv-line"><span>{{ t("CUSTOMER") }}</span>{{ invoice.customerName || "—" }}</div>
                        <div v-if="invoice.customerPhone" class="inv-line"><span>{{ t("PHONE") }}</span>{{ invoice.customerPhone }}</div>
                        <div v-if="invoice.customerEmail" class="inv-line"><span>{{ t("EMAIL") }}</span>{{ invoice.customerEmail }}</div>
                    </div>
                    <div class="inv-box">
                        <div class="inv-box-title">{{ t("DETAILS") }}</div>
                        <div class="inv-line"><span>{{ t("INVOICE_NO") }}</span>{{ invoice.saleCode }}</div>
                        <div class="inv-line"><span>{{ t("DATE") }}</span>{{ UT.localDateTime(invoice.saleDate) }}</div>
                        <div class="inv-line"><span>{{ t("STATUS") }}</span>{{ invoice.statusName || invoice.status }}</div>
                        <div class="inv-line"><span>{{ t("PAYMENT") }}</span>{{ invoice.paymentStatusName || invoice.paymentStatus }}</div>
                    </div>
                </div>

                <div class="inv-table-wrap">
                    <table class="inv-table">
                        <thead>
                            <tr>
                                <th class="ctr">#</th>
                                <th>{{ t("DESCRIPTION") }}</th>
                                <th class="ctr">{{ t("QTY") }}</th>
                                <th class="num">{{ t("PRICE") }}</th>
                                <th class="num">{{ t("DISCOUNT") }}</th>
                                <th class="num">{{ t("AMOUNT") }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(it, i) in items" :key="i">
                                <td class="ctr">{{ i + 1 }}</td>
                                <td>
                                    <div>{{ it.productName }}<span v-if="it.isFreeItem" class="inv-free"> (FREE)</span></div>
                                    <div v-if="it.isBundle && it.bundleName" class="inv-bundle">{{ t("BUNDLE") }}: {{ it.bundleName }}</div>
                                    <div v-if="it.productCode" class="inv-item-code">{{ it.productCode }}</div>
                                </td>
                                <td class="ctr">{{ it.quantity }}<template v-if="it.unitName"> {{ it.unitName }}</template></td>
                                <td class="num">{{ money(it.unitPrice) }}</td>
                                <td class="num">{{ money(it.discountAmount) }}</td>
                                <td class="num">{{ money(it.amount) }}</td>
                            </tr>
                            <tr v-if="!items.length">
                                <td class="ctr" colspan="6">{{ t("NO_ITEMS") }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="inv-foot">
                    <div class="inv-notes">
                        <div class="inv-box-title">{{ t("NOTES") }}</div>
                        <div>{{ invoice.notes || "—" }}</div>
                    </div>
                    <div class="inv-summary">
                        <div class="inv-sum-row"><span class="lbl">{{ t("SUBTOTAL") }}</span><span class="val">{{ money(invoice.subtotal) }}</span></div>
                        <div v-if="num(invoice.discountAmount)" class="inv-sum-row"><span class="lbl">{{ t("DISCOUNT") }}</span><span class="val">-{{ money(invoice.discountAmount) }}</span></div>
                        <div v-if="num(invoice.taxAmount)" class="inv-sum-row"><span class="lbl">{{ t("TAX") }}</span><span class="val">{{ money(invoice.taxAmount) }}</span></div>
                        <div class="inv-sum-row total"><span class="lbl">{{ t("TOTAL") }}</span><span class="val">{{ money(invoice.totalAmount) }}</span></div>
                        <div v-if="num(invoice.paidAmount)" class="inv-sum-row"><span class="lbl">{{ t("PAID") }}</span><span class="val">{{ money(invoice.paidAmount) }}</span></div>
                        <div v-if="num(invoice.changeAmount)" class="inv-sum-row"><span class="lbl">{{ t("CHANGE") }}</span><span class="val">{{ money(invoice.changeAmount) }}</span></div>
                    </div>
                </div>

                <div v-if="payments.length" class="inv-pay">
                    <div class="inv-box-title">{{ t("PAYMENTS") }}</div>
                    <div v-for="(p, i) in payments" :key="i" class="inv-pay-row">
                        <span>{{ p.methodName }}<template v-if="p.referenceNumber"> · {{ p.referenceNumber }}</template></span>
                        <span>{{ money(p.amount) }}</span>
                    </div>
                </div>

                <div v-if="store.terms" class="inv-terms">
                    <div class="inv-box-title">{{ t("TERMS") }}</div>
                    <!-- owner-set rich text (v1 stored HTML); sanitized before v-html -->
                    <div class="inv-terms-body" v-html="termsHtml"></div>
                </div>

                <div class="inv-sign">
                    <div class="inv-sign-cell"><div class="inv-sign-line"></div><div class="inv-sign-label">{{ t("SIGN_BUYER") }}</div></div>
                    <div class="inv-sign-cell"><div class="inv-sign-line"></div><div class="inv-sign-label">{{ t("SIGN_SELLER") }}</div></div>
                    <div class="inv-sign-cell"><div class="inv-sign-line"></div><div class="inv-sign-label">{{ t("SIGN_RECEIVED") }}</div></div>
                </div>
            </div>
        </div>

        <!-- 80mm receipt: only rendered (and visible) while printing it -->
        <div v-if="mode === 'receipt'" class="inv-receipt inv-print-target" v-html="receiptHtml"></div>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import DOMPurify from "dompurify";
import UT from "@/core/utilities/ut";
import { BizCheckMobileDevice } from "@/shared/bizcheckmobile";
import { INVOICE_A4_STYLES, POS_RECEIPT_STYLES, buildReceiptHtml } from "./invoice-styles";
import { injectStyles, printTarget } from "./print-target";
import type { SaleInvoice } from "@/models/POS/invoice";

/** Shared A4 sale invoice (+ 80mm receipt print). Print is web-only: window.print() is a no-op in the native shell. */
defineOptions({ name: "InvoiceDocument" });

const props = defineProps<{ invoice: SaleInvoice }>();
const { t: $t } = useI18n();
const t = (key: string) => $t(`INVOICE.${key}`);

const canPrint = !BizCheckMobileDevice.isApp(); // no print gateway in the native shell yet
const mode = ref<"a4" | "receipt">("a4");
const store = computed(() => props.invoice.store ?? {});
const items = computed(() => props.invoice.items ?? []);
const payments = computed(() => props.invoice.payments ?? []);
const termsHtml = computed(() => DOMPurify.sanitize(store.value.terms ?? ""));
const receiptHtml = computed(() => buildReceiptHtml(props.invoice, money));

const num = (v: unknown) => Number(v) || 0;
function money(v: unknown): string {
    return "$ " + UT.currency((v as string | number) ?? 0, "USD");
}

// Same A4 sheet as the print, so the preview matches it.
onMounted(() => injectStyles("inv-a4-styles", INVOICE_A4_STYLES));

function printInvoice(): void {
    mode.value = "a4";
    printTarget();
}
async function printReceipt(): Promise<void> {
    mode.value = "receipt";
    await nextTick();
    printTarget(POS_RECEIPT_STYLES);
    mode.value = "a4";
}
</script>

<style scoped>
.inv-wrap { display: flex; flex-direction: column; gap: 12px; }
.inv-toolbar { display: flex; gap: 8px; }
.inv-receipt { display: none; }
/* Phone preview: the A4 sheet reflows to the screen; the table scrolls sideways. Print keeps A4. */
@media screen {
    .inv-wrap .inv-doc { width: 100%; max-width: 100%; }
    .inv-wrap :deep(.inv-header), .inv-wrap :deep(.inv-info), .inv-wrap :deep(.inv-foot) { flex-wrap: wrap; padding-left: 12px; padding-right: 12px; }
    .inv-wrap :deep(.inv-box), .inv-wrap :deep(.inv-notes), .inv-wrap :deep(.inv-summary) { flex: 1 1 100%; }
    .inv-wrap :deep(.inv-table-wrap) { overflow-x: auto; padding-left: 12px; padding-right: 12px; }
    .inv-wrap :deep(.inv-sign) { gap: 8px; padding: 16px 12px; }
}
</style>
