<template>
	<div class="inv-wrap">
		<div v-if="canPrint" class="inv-toolbar no-print">
			<ion-button size="small" @click="printDoc">{{ t("PRINT_A4") }}</ion-button>
		</div>
		<div class="inv-scroll">
            <div class="inv-doc inv-print-target">
                <div class="inv-card">
                    <div class="inv-header">
                        <div>
                            <div class="inv-store-name">{{ store.name || "—" }}</div>
                            <div v-if="store.address" class="inv-store-line">{{ store.address }}</div>
                            <div v-if="store.phone" class="inv-store-line">Tel: {{ store.phone }}</div>
                            <div v-if="store.email" class="inv-store-line">{{ store.email }}</div>
                        </div>
                        <div class="inv-title">
                            <h1>{{ t("QUOTATION_TITLE") }}</h1>
                            <div class="inv-code">{{ quo.quotationNo }}</div>
                        </div>
                    </div>
    
                    <div class="inv-info">
                        <div class="inv-box">
                            <div class="inv-box-title">{{ t("BILL_TO") }}</div>
                            <div class="inv-line"><span>{{ t("CUSTOMER") }}</span>{{ quo.customerName || "—" }}</div>
                            <div v-if="quo.phoneNo" class="inv-line"><span>{{ t("PHONE") }}</span>{{ quo.phoneNo }}</div>
                        </div>
                        <div class="inv-box">
                            <div class="inv-box-title">{{ t("DETAILS") }}</div>
                            <div class="inv-line"><span>{{ t("QUOTATION_NO") }}</span>{{ quo.quotationNo }}</div>
                            <div class="inv-line"><span>{{ t("DATE") }}</span>{{ (quo.quotationDate || "").slice(0, 10) }}</div>
                            <div v-if="quo.inventoryName" class="inv-line"><span>{{ t("INVENTORY") }}</span>{{ quo.inventoryName }}</div>
                            <div class="inv-line"><span>{{ t("STATUS") }}</span>{{ quo.quotationStatusName || quo.quotationStatusCode || quo.status }}</div>
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
                                    <td class="ctr">{{ it.lineNo ?? i + 1 }}</td>
                                    <td>
                                        <div>{{ it.productName }}</div>
                                        <div v-if="it.productCode" class="inv-item-code">{{ it.productCode }}</div>
                                    </td>
                                    <td class="ctr">{{ it.quantity }}</td>
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
                            <div class="inv-box-title">{{ t("REMARK") }}</div>
                            <div>{{ quo.remark || "—" }}</div>
                        </div>
                        <div class="inv-summary">
                            <div class="inv-sum-row"><span class="lbl">{{ t("SUBTOTAL") }}</span><span class="val">{{ money(subTotal) }}</span></div>
                            <div v-if="discountTotal" class="inv-sum-row"><span class="lbl">{{ t("DISCOUNT") }}</span><span class="val">-{{ money(discountTotal) }}</span></div>
                            <div class="inv-sum-row total"><span class="lbl">{{ t("TOTAL") }}</span><span class="val">{{ money(quo.totalAmount) }}</span></div>
                        </div>
                    </div>
    
                    <div class="inv-sign">
                        <div class="inv-sign-cell"><div class="inv-sign-line"></div><div class="inv-sign-label">{{ t("SIGN_BUYER") }}</div></div>
                        <div class="inv-sign-cell"><div class="inv-sign-line"></div><div class="inv-sign-label">{{ t("SIGN_SELLER") }}</div></div>
                    </div>
                </div>
            </div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { injectStyles, printTarget } from "./print-target";
import { useI18n } from "vue-i18n";
import UT from "@/core/utilities/ut";
import { BizCheckMobileDevice } from "@/shared/bizcheckmobile";
import { INVOICE_A4_STYLES } from "./invoice-styles";
import type { QuotationDetail, QuotationDetailItem } from "@/models/POS/SAL/SAL15000";
import type { InvoiceStore } from "@/models/POS/invoice";

/** A4 quotation, shown in a popup body (SAL15000). */
defineOptions({ name: "QuotationDocument" });

const STYLE_TAG_ID = "inv-a4-styles";
const props = withDefaults(defineProps<{ quo: QuotationDetail; items?: QuotationDetailItem[] }>(), { items: () => [] });
const { t: $t } = useI18n();
const t = (key: string) => $t(`INVOICE.${key}`);
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");
// window.print() is a no-op in the native shell (and there is no per-document PDF), so print is web-only.
const canPrint = !BizCheckMobileDevice.isApp(); // no print gateway in the native shell yet
const printDoc = () => printTarget();
const store = computed<InvoiceStore>(() => props.quo.store ?? {});
const subTotal = computed(() => Number(props.quo.subTotalAmount ?? props.quo.subTotal ?? props.quo.subtotal ?? 0));
const discountTotal = computed(() => Number(props.quo.discountAmount ?? props.quo.discountTotal ?? 0));

// Same A4 sheet as the print, so the preview matches it.
onMounted(() => injectStyles(STYLE_TAG_ID, INVOICE_A4_STYLES));
</script>

<style scoped>
.inv-wrap { display: flex; flex-direction: column; gap: 8px; }
.inv-toolbar { display: flex; gap: 8px; }
/* The A4 paper keeps its print width; the phone scrolls it sideways. */
.inv-scroll { overflow-x: auto; }
@media print { .no-print { display: none !important; } }
</style>
