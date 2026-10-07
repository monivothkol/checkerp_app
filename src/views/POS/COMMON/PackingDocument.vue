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
                            <h1>{{ t("PACKING_TITLE") }}</h1>
                            <div class="inv-code">{{ pkg.packagingCode }}</div>
                        </div>
                    </div>
    
                    <div class="inv-info">
                        <div class="inv-box">
                            <div class="inv-box-title">{{ t("DETAILS") }}</div>
                            <div class="inv-line"><span>{{ t("PACKING_NO") }}</span>{{ pkg.packagingCode }}</div>
                            <div v-if="pkg.saleCode" class="inv-line"><span>{{ t("SALE_NO") }}</span>{{ pkg.saleCode }}</div>
                            <div v-if="pkg.packerName" class="inv-line"><span>{{ t("PACKER") }}</span>{{ pkg.packerName }}</div>
                            <div v-if="pkg.referenceNumber" class="inv-line"><span>{{ t("REFERENCE") }}</span>{{ pkg.referenceNumber }}</div>
                        </div>
                        <div class="inv-box">
                            <div class="inv-box-title">&nbsp;</div>
                            <div class="inv-line"><span>{{ t("STATUS") }}</span>{{ pkg.status }}</div>
                            <div v-if="pkg.packagedAt" class="inv-line"><span>{{ t("DATE") }}</span>{{ pkg.packagedAt }}</div>
                            <div v-else-if="pkg.createdAt" class="inv-line"><span>{{ t("DATE") }}</span>{{ pkg.createdAt }}</div>
                        </div>
                    </div>
    
                    <div class="inv-table-wrap">
                        <table class="inv-table">
                            <thead>
                                <tr>
                                    <th class="ctr">#</th>
                                    <th>{{ t("DESCRIPTION") }}</th>
                                    <th>{{ t("SKU") }}</th>
                                    <th class="ctr">{{ t("REQUIRED") }}</th>
                                    <th class="ctr">{{ t("PACKED") }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(it, i) in items" :key="i">
                                    <td class="ctr">{{ i + 1 }}</td>
                                    <td>{{ it.productName }}</td>
                                    <td class="inv-item-code">{{ it.productCode || it.barcode || "—" }}</td>
                                    <td class="ctr">{{ it.quantityRequired }}</td>
                                    <td class="ctr">{{ it.quantityPackaged }}</td>
                                </tr>
                                <tr v-if="!items.length">
                                    <td class="ctr" colspan="5">{{ t("NO_ITEMS") }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
    
                    <div class="inv-foot">
                        <div class="inv-notes">
                            <div class="inv-box-title">{{ t("NOTES") }}</div>
                            <div>{{ pkg.notes || "—" }}</div>
                        </div>
                        <div class="inv-summary"></div>
                    </div>
    
                    <div class="inv-sign">
                        <div class="inv-sign-cell"><div class="inv-sign-line"></div><div class="inv-sign-label">{{ t("PACKER") }}</div></div>
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
import { BizCheckMobileDevice } from "@/shared/bizcheckmobile";
import { INVOICE_A4_STYLES } from "./invoice-styles";
import type { PackagingHeader, PackagingItem } from "@/models/POS/SAL/SAL30000";
import type { InvoiceStore } from "@/models/POS/invoice";

/** A4 packing slip, shown in a popup body (SAL34000). */
defineOptions({ name: "PackingDocument" });

const STYLE_TAG_ID = "inv-a4-styles";
const props = withDefaults(defineProps<{ pkg: PackagingHeader; items?: PackagingItem[] }>(), { items: () => [] });
const { t: $t } = useI18n();
const t = (key: string) => $t(`INVOICE.${key}`);
// window.print() is a no-op in the native shell (and there is no per-document PDF), so print is web-only.
const canPrint = !BizCheckMobileDevice.isApp(); // no print gateway in the native shell yet
const printDoc = () => printTarget();
const store = computed<InvoiceStore>(() => props.pkg.store ?? {});

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
