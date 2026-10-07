<template>
    <ion-page>
        <bm-header :title="tr('PAGE_TITLE')" default-href="/SIV10000" />
        <ion-content>
            <ion-progress-bar v-if="store.loading" type="indeterminate" />
            <template v-else-if="store.invoice">
                <div class="siv_actions">
                    <ion-button v-if="canEdit" size="small" @click="go('/SIV15000')">{{ tr("EDIT") }}</ion-button>
                    <ion-button v-if="canPay" size="small" color="success" @click="openPay">{{ tr("PAY") }}</ion-button>
                    <ion-button v-if="!store.isClosed" size="small" fill="outline" @click="go('/SAL21000')">{{ tr("CREATE_RETURN") }}</ion-button>
                    <ion-button v-if="store.invoice.packagingId" size="small" fill="outline" @click="viewPackaging">{{ tr("VIEW_PACKING") }}</ion-button>
                    <ion-button v-else-if="!store.isClosed" size="small" fill="outline" @click="go('/SAL31000')">{{ tr("CREATE_PACKING") }}</ion-button>
                    <ion-button v-if="store.invoice.deliveryId" size="small" fill="outline" @click="viewDelivery">{{ tr("VIEW_DELIVERY") }}</ion-button>
                    <ion-button v-else-if="!store.isClosed" size="small" fill="outline" @click="go('/SAL41000')">{{ tr("CREATE_DELIVERY") }}</ion-button>
                    <ion-button v-if="store.canCancel" size="small" fill="outline" color="danger" :disabled="store.voiding" @click="onCancel">{{ tr("CANCEL_INVOICE") }}</ion-button>
                </div>

                <div class="siv_doc"><InvoiceDocument :invoice="store.invoice" /></div>

                <ion-list class="scr_list" lines="full">
                    <ion-item>
                        <ion-label>{{ tr("PACKAGING") }}</ion-label>
                        <ion-badge slot="end" :color="store.invoice.packagingId ? 'success' : 'medium'">{{ store.invoice.packagingId ? "✓" : "—" }}</ion-badge>
                    </ion-item>
                    <ion-item>
                        <ion-label>{{ tr("DELIVERY") }}</ion-label>
                        <ion-badge slot="end" :color="store.invoice.deliveryId ? 'success' : 'medium'">{{ store.invoice.deliveryId ? "✓" : "—" }}</ion-badge>
                    </ion-item>
                </ion-list>

                <ion-list v-if="store.auditList.length" class="scr_list" lines="full">
                    <ion-list-header>{{ tr("CHANGE_HISTORY") }}</ion-list-header>
                    <ion-item v-for="(e, i) in store.auditList" :key="i">
                        <ion-label class="ion-text-wrap">
                            <h3>{{ e.userName }}<template v-if="e.username"> ({{ e.username }})</template></h3>
                            <p class="audit_when">{{ fmtDateTime(e.changedAt) }}</p>
                            <p v-for="(c, j) in changesOf(e)" :key="j">
                                <span class="audit_field">{{ c.label }}</span>
                                <s class="audit_old">{{ c.oldValue || "—" }}</s> → <span class="audit_new">{{ c.newValue || "—" }}</span>
                            </p>
                        </ion-label>
                    </ion-item>
                </ion-list>
            </template>
            <bm-empty-state v-else description="SIV13000.NOT_FOUND" />
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import POP from "@/core/utilities/pop";
import { useViewEnter } from "@/core/modules/use-view-enter";
import InvoiceDocument from "@/views/POS/COMMON/InvoiceDocument.vue";
import InvoicePayModal from "@/views/POS/SIV/InvoicePayModal.vue";
import { SIV13000Store } from "@/store/POS/SIV/SIV13000Store";
import type { InvoiceAuditEntry } from "@/models/POS/invoice";
import type { SaleRow } from "@/models/POS/SIV/SIV10000";

/** Invoice detail: document, edit/pay/cancel guards, return/packing/delivery links, change history. */
defineOptions({ name: "SIV13000" });

const { t } = useI18n();
const tr = (key: string) => t(`SIV13000.${key}`);
const route = useRoute();
const router = useRouter();
const store = SIV13000Store();
const code = computed(() => String(route.query.saleCode ?? ""));
const statusOf = () => String(store.invoice?.status ?? "").toUpperCase();

useViewEnter(() => store.load(code.value));

// Editable only while live, unpaid and free of returns (backend enforces the same).
const canEdit = computed(() => {
    if (!store.invoice) return false;
    if (["CANCELLED", "VOIDED", "REFUNDED", "PARTIAL_REFUNDED", "PROCESSING_REFUND"].includes(statusOf())) return false;
    return String(store.invoice.paymentStatus ?? "").toUpperCase() !== "PAID";
});
// Payable while not cancelled/voided and there's an outstanding balance.
const canPay = computed(() => {
    const inv = store.invoice;
    if (!inv || ["CANCELLED", "VOIDED"].includes(statusOf())) return false;
    return Number(inv.totalAmount ?? 0) - Number(inv.paidAmount ?? 0) - Number(inv.creditAppliedAmount ?? 0) > 0;
});

function go(path: string): void {
    router.push(`${path}?saleCode=${encodeURIComponent(code.value)}`);
}
const fmtDateTime = (d?: string) => (d ? String(d).replace("T", " ").replace("Z", "").slice(0, 16) : "");

/** Pair the changed-field JSON old → new with a friendly label. */
function changesOf(entry: InvoiceAuditEntry): { label: string; oldValue: string; newValue: string }[] {
    const labels: Record<string, string> = {
        customerName: tr("F_CUSTOMER"), customerPhone: tr("F_PHONE"), notes: tr("F_NOTES"),
        manualInvoiceDiscount: tr("F_DISCOUNT"), taxAmount: tr("F_TAX"), totalAmount: tr("F_TOTAL")
    };
    const parse = (s?: string): Record<string, unknown> => {
        try { return s ? JSON.parse(s) : {}; } catch { return {}; }
    };
    const oldV = parse(entry.oldValues);
    const newV = parse(entry.newValues);
    return Object.keys(newV).map((k) => ({ label: labels[k] ?? k, oldValue: String(oldV[k] ?? ""), newValue: String(newV[k] ?? "") }));
}

/** Payment stays allowed on a returned invoice, but warn first (matches SIV10000). */
function openPay(): void {
    if (!["REFUNDED", "PARTIAL_REFUNDED", "PROCESSING_REFUND"].includes(statusOf())) { showPayModal(); return; }
    POP.confirm({ title: tr("PAY"), content: tr("PAY_RETURN_WARN"), okBtn: { btnText: tr("PAY"), onClick: showPayModal } });
}
function showPayModal(): void {
    const inv = store.invoice;
    if (!inv) return;
    const sale: SaleRow = {
        saleId: "",
        saleCode: inv.saleCode ?? "",
        saleDate: inv.saleDate ?? "",
        customerName: inv.customerName,
        totalAmount: Number(inv.totalAmount ?? 0),
        paidAmount: Number(inv.paidAmount ?? 0),
        creditAppliedAmount: Number(inv.creditAppliedAmount ?? 0),
        status: inv.status,
        paymentStatus: inv.paymentStatus ?? ""
    };
    POP.showPopup(InvoicePayModal, { title: t("SIV13100.TITLE"), props: { sale } }).promise.then(() => store.load(code.value)).catch(() => undefined);
}
function viewPackaging(): void {
    router.push(`/SAL34000?packagingId=${encodeURIComponent(store.invoice?.packagingId ?? "")}`);
}
function viewDelivery(): void {
    router.push(`/SAL74000?deliveryId=${encodeURIComponent(store.invoice?.deliveryId ?? "")}`);
}
/** Cancel cascades on the backend (reverses accounting/returns/payments, restores stock). */
function onCancel(): void {
    POP.confirm({
        title: tr("CANCEL_INVOICE"),
        content: tr("CANCEL_CONFIRM"),
        okBtn: {
            onClick: () => store.cancel(code.value, (ok, err) => {
                if (ok) POP.openNotification({ type: "success", content: tr("CANCELLED_MSG") });
                else POP.alert({ status: "error", content: (err as { message?: string } | undefined)?.message || tr("CANCEL_FAILED") });
            })
        }
    });
}
</script>

<style scoped>
.siv_actions { display: flex; flex-wrap: wrap; gap: 4px; padding: 8px 12px; }
.siv_doc { padding: 0 12px; }
ion-list-header { font-size: 14px; }
ion-label h3 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
.audit_when { font-size: 10px; }
.audit_field { color: var(--ion-color-medium); margin-right: 4px; }
.audit_old { color: var(--ion-color-danger); }
.audit_new { color: var(--ion-color-success); font-weight: 600; }
</style>
