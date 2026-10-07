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
                            <h1>{{ t("RETURN_TITLE") }}</h1>
                            <div class="inv-code">{{ ret.returnCode }}</div>
                        </div>
                    </div>
    
                    <div class="inv-info">
                        <div class="inv-box">
                            <div class="inv-box-title">{{ t("BILL_TO") }}</div>
                            <div class="inv-line"><span>{{ t("CUSTOMER") }}</span>{{ ret.customerName || "—" }}</div>
                            <div v-if="ret.customerPhone" class="inv-line"><span>{{ t("PHONE") }}</span>{{ ret.customerPhone }}</div>
                            <div v-if="ret.customerAddress" class="inv-line"><span>{{ t("ADDRESS") }}</span>{{ ret.customerAddress }}</div>
                        </div>
                        <div class="inv-box">
                            <div class="inv-box-title">{{ t("DETAILS") }}</div>
                            <div class="inv-line"><span>{{ t("RETURN_NO") }}</span>{{ ret.returnCode }}</div>
                            <div class="inv-line"><span>{{ t("SALE_NO") }}</span>{{ ret.saleCode }}</div>
                            <div class="inv-line"><span>{{ t("DATE") }}</span>{{ localDateTime(ret.returnedAt) }}</div>
                            <div class="inv-line"><span>{{ t("STATUS") }}</span><span class="badge" :class="statusVariant">{{ ret.status }}</span></div>
                        </div>
                    </div>
    
                    <div class="inv-table-wrap">
                        <table class="inv-table">
                            <thead>
                                <tr>
                                    <th class="ctr">#</th>
                                    <th>{{ t("DESCRIPTION") }}</th>
                                    <th class="ctr">{{ t("SOLD") }}</th>
                                    <th class="ctr">{{ t("RETURNED") }}</th>
                                    <th class="num">{{ t("PRICE") }}</th>
                                    <th class="num">{{ t("REFUND") }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(it, i) in items" :key="i">
                                    <td class="ctr">{{ i + 1 }}</td>
                                    <td>
                                        <div>{{ it.productName }}</div>
                                        <div v-if="it.productCode" class="inv-item-code">{{ it.productCode }}</div>
                                    </td>
                                    <td class="ctr">{{ it.quantitySold }}</td>
                                    <td class="ctr">{{ it.quantityReturned }}</td>
                                    <td class="num">{{ money(it.unitPrice) }}</td>
                                    <td class="num">{{ money(it.refundAmount) }}</td>
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
                            <div>{{ ret.notes || "—" }}</div>
                        </div>
                        <div class="inv-summary">
                            <div class="inv-sum-row total"><span class="lbl">{{ t("TOTAL_REFUND") }}</span><span class="val">{{ money(ret.totalRefund) }}</span></div>
                        </div>
                    </div>
    
                    <div class="inv-sign">
                        <div class="inv-sign-cell"><div class="inv-sign-line"></div><div class="inv-sign-label">{{ t("SIGN_BUYER") }}</div></div>
                        <div class="inv-sign-cell"><div class="inv-sign-line"></div><div class="inv-sign-label">{{ t("SIGN_SELLER") }}</div></div>
                        <div class="inv-sign-cell"><div class="inv-sign-line"></div><div class="inv-sign-label">{{ t("SIGN_RECEIVED") }}</div></div>
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
import type { ReturnDetailHeader, ReturnDetailItem } from "@/models/POS/SAL/SAL24000";
import type { InvoiceStore } from "@/models/POS/invoice";

/** A4 sale-return slip, shown in a popup body (SAL24000). */
defineOptions({ name: "ReturnDocument" });

const STYLE_TAG_ID = "inv-a4-styles";
const props = withDefaults(defineProps<{ ret: ReturnDetailHeader; items?: ReturnDetailItem[] }>(), { items: () => [] });
const { t: $t } = useI18n();
const t = (key: string) => $t(`INVOICE.${key}`);
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");
// window.print() is a no-op in the native shell (and there is no per-document PDF), so print is web-only.
const canPrint = !BizCheckMobileDevice.isApp(); // no print gateway in the native shell yet
const printDoc = () => printTarget();
const localDateTime = (v?: string) => UT.localDateTime(v);
const store = computed<InvoiceStore>(() => props.ret.store ?? {});
// Map the return status onto a global .badge colour variant.
const statusVariant = computed(() => {
	const s = String(props.ret.status ?? "").toUpperCase();
	return ({ PENDING: "approving", APPROVED: "approved", REJECTED: "rejected" } as Record<string, string>)[s] ?? "waiting";
});

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
