<template>
    <div class="inv-wrap">
        <div v-if="canPrint" class="inv-toolbar">
            <ion-button size="small" @click="printTarget()">{{ st("PRINT_A4") }}</ion-button>
        </div>

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
                        <h1>{{ st("TITLE") }}</h1>
                        <div class="inv-code">{{ periodLabel }}</div>
                    </div>
                </div>

                <div class="inv-info">
                    <div class="inv-box">
                        <div class="inv-box-title">{{ st("CUSTOMER_INFO") }}</div>
                        <div class="inv-line"><span>{{ t("CUSTOMER") }}</span>{{ customer.customerName || "—" }}</div>
                        <div v-if="customer.customerCode" class="inv-line"><span>{{ st("CODE") }}</span>{{ customer.customerCode }}</div>
                        <div v-if="customer.phone" class="inv-line"><span>{{ t("PHONE") }}</span>{{ customer.phone }}</div>
                        <div v-if="customer.customerAddress" class="inv-line"><span>{{ t("ADDRESS") }}</span>{{ customer.customerAddress }}</div>
                    </div>
                    <div class="inv-box">
                        <div class="inv-box-title">{{ st("SUMMARY") }}</div>
                        <div class="inv-line"><span>{{ st("INVOICED") }}</span>{{ money(report.totalInvoicesAmount) }} ({{ report.totalInvoicesCount ?? 0 }})</div>
                        <div class="inv-line"><span>{{ st("PAID") }}</span>{{ money(report.totalPaidAmount) }}</div>
                        <div class="inv-line"><span>{{ st("RETURNS") }}</span>{{ money(report.totalReturnsAmount) }} ({{ report.totalReturnsCount ?? 0 }})</div>
                        <div class="inv-line"><span>{{ st("OUTSTANDING") }}</span>{{ money(report.totalOutstandingAmount) }}</div>
                        <div class="inv-line"><span>{{ st("NET_BALANCE") }}</span>{{ money(report.netBalance) }}</div>
                    </div>
                </div>

                <div class="inv-table-wrap">
                    <table class="inv-table">
                        <thead>
                            <tr>
                                <th>{{ st("DATE") }}</th>
                                <th>{{ st("TYPE") }}</th>
                                <th>{{ st("CODE") }}</th>
                                <th>{{ st("REFERENCE") }}</th>
                                <th class="num">{{ st("AMOUNT") }}</th>
                                <th class="ctr">{{ st("STATUS") }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(row, i) in ledger" :key="i">
                                <td>{{ row.date ? String(row.date).slice(0, 10) : "—" }}</td>
                                <td>{{ st(row.type === "RETURN" ? "TYPE_RETURN" : "TYPE_INVOICE") }}</td>
                                <td>{{ row.code }}</td>
                                <td>{{ row.reference || "—" }}</td>
                                <td class="num">{{ money(row.amount) }}</td>
                                <td class="ctr">{{ row.status }}</td>
                            </tr>
                            <tr v-if="!ledger.length"><td class="ctr" colspan="6">{{ st("NO_RECORDS") }}</td></tr>
                        </tbody>
                    </table>
                </div>

                <div class="inv-sign">
                    <div class="inv-sign-cell"><div class="inv-sign-line"></div><div class="inv-sign-label">{{ st("SIGN_ISSUER") }}</div></div>
                    <div class="inv-sign-cell"><div class="inv-sign-line"></div><div class="inv-sign-label">{{ st("SIGN_RECEIVED") }}</div></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import UT from "@/core/utilities/ut";
import { BizCheckMobileDevice } from "@/shared/bizcheckmobile";
import { INVOICE_A4_STYLES } from "./invoice-styles";
import { injectStyles, printTarget } from "./print-target";
import type { CUS17000Response } from "@/models/POS/CUS/CUS17000";
import type { CustomerLookup } from "@/models/POS/COMMON/lookups";

/** A4 customer balance statement (store + customer + summary + ledger); print is web-only. */
defineOptions({ name: "StatementDocument" });

const props = defineProps<{ report: CUS17000Response }>();
const { t: $t } = useI18n();
const t = (key: string) => $t(`INVOICE.${key}`);
const st = (key: string) => $t(`STATEMENT.${key}`);

const canPrint = !BizCheckMobileDevice.isApp(); // no print gateway in the native shell yet
const store = computed(() => props.report.store ?? {});
const customer = computed<CustomerLookup>(() => props.report.customer ?? ({ customerId: "", customerName: "" } as CustomerLookup));
const periodLabel = computed(() => {
    const s = props.report.startDate ? String(props.report.startDate).slice(0, 10) : "";
    const e = props.report.endDate ? String(props.report.endDate).slice(0, 10) : "";
    return s || e ? `${s} → ${e}` : "";
});
// Pre-merged, latest-first ledger from the backend.
const ledger = computed(() => props.report.ledger ?? []);

const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");
onMounted(() => injectStyles("inv-a4-styles", INVOICE_A4_STYLES));
</script>

<style scoped>
.inv-wrap { display: flex; flex-direction: column; gap: 12px; }
.inv-toolbar { display: flex; gap: 8px; }
@media screen {
    .inv-wrap .inv-doc { width: 100%; max-width: 100%; }
    .inv-wrap :deep(.inv-header), .inv-wrap :deep(.inv-info) { flex-wrap: wrap; padding-left: 12px; padding-right: 12px; }
    .inv-wrap :deep(.inv-box) { flex: 1 1 100%; }
    .inv-wrap :deep(.inv-table-wrap) { overflow-x: auto; padding-left: 12px; padding-right: 12px; }
    .inv-wrap :deep(.inv-sign) { gap: 8px; padding: 16px 12px; }
}
</style>
