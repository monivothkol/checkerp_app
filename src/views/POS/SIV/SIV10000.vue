<template>
    <ion-page>
        <bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
            <template #end>
                <ion-button @click="onExport"><ion-icon slot="icon-only" :icon="downloadOutline" /></ion-button>
                <ion-button @click="onOpenFilter"><ion-icon slot="icon-only" :icon="funnelOutline" /></ion-button>
            </template>
            <template #bottom>
                <ion-toolbar>
                    <ion-searchbar v-model="store.keyword" :placeholder="tr('SEARCH_PLACEHOLDER')" :debounce="400" @ion-input="reload" />
                </ion-toolbar>
                <div v-if="chips.length" class="siv_chips">
                    <ion-chip v-for="c in chips" :key="c.key" @click="removeFilter(c.key)">
                        <ion-label>{{ c.label }}<template v-if="c.value">: {{ c.value }}</template></ion-label>
                        <ion-icon :icon="closeCircle" />
                    </ion-chip>
                </div>
            </template>
        </bm-header>

        <ion-content>
            <ion-refresher slot="fixed" @ion-refresh="onRefresh($event)">
                <ion-refresher-content />
            </ion-refresher>
            <div v-if="totalCount" class="siv_total">
                <span>{{ $t("LIST.TOTAL_ITEMS", { total: totalCount }) }}</span>
                <span v-if="totals">{{ tr("COL_FINAL") }} <strong>{{ money(totals.totalAmount) }}</strong></span>
            </div>
            <p v-if="totals" class="siv_sums">
                {{ tr("COL_SUBTOTAL") }} {{ money(totals.subtotal) }} · {{ tr("COL_DISCOUNT") }} {{ money(totals.discountAmount) }}
                <template v-if="costVisible"> · {{ tr("COL_COST") }} {{ money(totals.totalCost) }}</template>
            </p>

            <ion-list v-if="rows.length" class="scr_list">
                <ion-item-sliding v-for="r in rows" :key="r.saleCode">
                    <ion-item button :detail="false" @click="openDetail(r.saleCode)">
                        <ion-label>
                            <p class="siv_code">{{ r.saleCode }} · {{ UT.localDateTime(r.saleDate) }}</p>
                            <h2>{{ r.customerName || tr("WALK_IN") }}<template v-if="r.customerPhone"> · {{ r.customerPhone }}</template></h2>
                            <p>{{ r.inventoryName }}<template v-if="r.salePersonName"> · {{ r.salePersonName }}</template><template v-if="r.sellType"> · {{ r.sellType }}</template></p>
                            <p>
                                {{ tr("COL_FINAL") }}: <strong>{{ money(r.totalAmount) }}</strong>
                                <template v-if="Number(r.discountAmount)"> · {{ tr("COL_DISCOUNT") }} {{ money(r.discountAmount) }}</template>
                                <template v-if="costVisible"> · {{ tr("COL_COST") }} {{ money(r.totalCost) }}</template>
                            </p>
                            <p v-if="r.createdByName" class="siv_by">{{ tr("CREATED_BY") }}: {{ r.createdByName }}</p>
                        </ion-label>
                        <div slot="end" class="siv_badges">
                            <ion-badge :color="payColor(r.paymentStatus)">{{ statusLabel(r.paymentStatus) }}</ion-badge>
                            <ion-badge :color="saleStatusColor(r.status)">{{ saleStatusLabel(r.status) }}</ion-badge>
                        </div>
                    </ion-item>
                    <ion-item-options side="end">
                        <ion-item-option v-if="canEdit(r)" @click="openEdit(r.saleCode)">{{ tr("EDIT") }}</ion-item-option>
                        <ion-item-option v-if="canPay(r)" color="success" @click="openPay(r)">{{ tr("PAY") }}</ion-item-option>
                    </ion-item-options>
                </ion-item-sliding>
            </ion-list>
            <bm-empty-state v-else-if="!loading" />

            <ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)">
                <ion-infinite-scroll-content />
            </ion-infinite-scroll>

            <ion-fab slot="fixed" vertical="bottom" horizontal="end">
                <ion-fab-button @click="router.push('/SIV11000')"><ion-icon :icon="add" /></ion-fab-button>
            </ion-fab>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import type { InfiniteScrollCustomEvent, RefresherCustomEvent } from "@ionic/vue";
import { add, closeCircle, downloadOutline, funnelOutline } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { requestAsync, usePagedList } from "@/core/modules/use-paged-list";
import ModuleFilterPanel from "@/core/components/module/ModuleFilterPanel.vue";
import InvoicePayModal from "@/views/POS/SIV/InvoicePayModal.vue";
import SIV14000 from "@/views/POS/SIV/SIV14000.vue";
import { SIV10000Store, type SIV10000FilterValues } from "@/store/POS/SIV/SIV10000Store";
import type { ModuleListFilter } from "@/core/modules/module-screen-config";
import type { SaleListTotals, SaleRow, SIV10000Response } from "@/models/POS/SIV/SIV10000";

/** Invoice list: search, filter sheet (incl. date range + inventory), paged scroll, edit/pay row actions. */
defineOptions({ name: "SIV10000" });

const { t } = useI18n();
const tr = (key: string) => t(`SIV10000.${key}`);
const router = useRouter();
const store = SIV10000Store();
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");

// Filters + lookups live in the web store; paging is the app's infinite scroll over the same request.
const totals = ref<SaleListTotals | null>(null);
const costVisible = ref(false);
const paged = usePagedList<SaleRow>((pageNo, pageSize) => requestAsync<SIV10000Response>((listener) =>
    store.saleApi.request({ dataBody: { ...store.filterBody(), pageNo, pageSize }, listener }))
    .then((p) => {
        totals.value = p.totals ?? null;
        costVisible.value = p.costVisible === true; // Total Cost only with INVOICE:VIEW_PURCHASE_COST
        return { list: p.saleList ?? [], totalCount: p.totalCount };
    }));
const { rows, totalCount, loading, hasMore } = paged;
const reload = () => void paged.reload();

onMounted(() => store.loadLookups());
useViewEnter(reload);

async function onRefresh(ev: RefresherCustomEvent): Promise<void> {
    await paged.reload();
    await ev.target.complete();
}
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> {
    await paged.more();
    await ev.target.complete();
}

type PanelValues = SIV10000FilterValues & { dateRange?: [string, string]; inventoryId?: string };
const filterDefs = computed<ModuleListFilter[]>(() => {
    const defs: ModuleListFilter[] = [
        { key: "dateRange", labelKey: "COL_DATE", type: "dateRange" },
        { key: "inventoryId", labelKey: "INVENTORY", options: store.inventories.map((i) => ({ value: i.inventoryId, label: i.inventoryName ?? "" })) },
        { key: "paymentStatus", labelKey: "COL_PAYMENT", options: ["PAID", "PARTIAL", "UNPAID"].map((v) => ({ value: v, label: tr(v) })) },
        { key: "salePersonId", labelKey: "SALE_PERSON", options: store.salePersons.map((s) => ({ value: s.salePersonId, label: s.name ?? "" })) },
        { key: "sellType", labelKey: "SELL_TYPE", options: [{ value: "retail", label: tr("RETAIL") }, { value: "wholesale", label: tr("WHOLESALE") }] },
        { key: "customerType", labelKey: "CUSTOMER_TYPE", options: ["WALK_IN", "ONLINE_ORDER", "MEMBERSHIP"].map((v) => ({ value: v, label: tr(v) })) }
    ];
    // Created By needs USER:READ — the lookup fails silently and the filter hides.
    if (store.users.length) {
        defs.push({ key: "createdBy", labelKey: "CREATED_BY", options: store.users.map((u) => ({ value: u.userId, label: u.fullName || u.username || "" })) });
    }
    defs.push({ key: "hasDiscount", labelKey: "HAS_DISCOUNT", options: [{ value: true, label: tr("HAS_DISCOUNT") }] });
    return defs;
});
function panelValues(): PanelValues {
    return {
        ...store.filterValues(),
        dateRange: store.dateFrom && store.dateTo ? [store.dateFrom, store.dateTo] : undefined,
        inventoryId: store.inventoryId
    };
}
const chips = computed(() => {
    const values = panelValues() as Record<string, unknown>;
    return filterDefs.value.filter((f) => values[f.key] !== undefined && values[f.key] !== "").map((f) => {
        const v = values[f.key];
        const value = Array.isArray(v) ? `${v[0]} – ${v[1]}`
            : (f.options?.length ?? 0) > 1 ? f.options?.find((o) => o.value === v)?.label ?? String(v) : "";
        return { key: f.key, label: tr(f.labelKey), value };
    });
});
/** Panel values → store (date range + inventory are separate store fields), then reload page 1. */
function apply(v: PanelValues): void {
    store.dateFrom = v.dateRange?.[0];
    store.dateTo = v.dateRange?.[1];
    store.inventoryId = v.inventoryId;
    store.paymentStatus = v.paymentStatus;
    store.salePersonId = v.salePersonId;
    store.sellType = v.sellType;
    store.customerType = v.customerType;
    store.createdBy = v.createdBy;
    store.hasDiscount = v.hasDiscount === true;
    reload();
}
function onOpenFilter(): void {
    const optionsByKey: Record<string, { value: unknown; label: string }[]> = {};
    for (const f of filterDefs.value) optionsByKey[f.key] = f.options ?? [];
    POP.showPopup<PanelValues>(ModuleFilterPanel, {
        title: t("LIST.FILTER"),
        props: { filters: filterDefs.value, values: panelValues(), optionsByKey, listTr: "SIV10000" }
    }).promise.then((r) => apply(r.data ?? {})).catch(() => undefined);
}
function removeFilter(key: string): void {
    apply({ ...panelValues(), [key]: undefined });
}

function onExport(): void {
    POP.showPopup(SIV14000, { title: t("SIV14000.PAGE_TITLE"), props: { costVisible: costVisible.value } }).promise.catch(() => undefined);
}

function payColor(s?: string): string {
    if (s === "PAID") return "success";
    return s === "PARTIAL" ? "warning" : "danger";
}
function statusLabel(status?: string): string {
    const k = String(status ?? "").toUpperCase();
    return ["PAID", "PARTIAL", "UNPAID", "CANCELLED"].includes(k) ? tr(k) : String(status ?? "");
}
const saleStatusKey = (s?: string) => String(s ?? "").trim().toUpperCase();
function saleStatusLabel(status?: string): string {
    const key = `STATUS_${saleStatusKey(status)}`;
    const label = tr(key);
    return label === `SIV10000.${key}` ? String(status ?? "") : label;
}
function saleStatusColor(status?: string): string {
    switch (saleStatusKey(status)) {
        case "COMPLETED": return "success";
        case "PENDING":
        case "PARTIAL_REFUNDED":
        case "PROCESSING_REFUND": return "warning";
        default: return "medium"; // CANCELLED, VOIDED, REFUNDED
    }
}
// Any non-rejected return puts the invoice into a refund state.
const refunded = (r: SaleRow) => ["REFUNDED", "PARTIAL_REFUNDED", "PROCESSING_REFUND"].includes(saleStatusKey(r.status));
const cancelled = (r: SaleRow) => ["CANCELLED", "VOIDED"].includes(saleStatusKey(r.status));
// A returned/refunding invoice can't be edited (backend also blocks it).
const canEdit = (r: SaleRow) => !cancelled(r) && !refunded(r) && r.paymentStatus !== "PAID";
function canPay(r: SaleRow): boolean {
    const outstanding = Number(r.totalAmount ?? 0) - Number(r.paidAmount ?? 0) - Number(r.creditAppliedAmount ?? 0);
    return !cancelled(r) && outstanding > 0;
}

function openDetail(saleCode: string): void {
    router.push(`/SIV13000?saleCode=${encodeURIComponent(saleCode)}`);
}
function openEdit(saleCode: string): void {
    router.push(`/SIV15000?saleCode=${encodeURIComponent(saleCode)}`);
}
/** Payment stays allowed on a returned invoice, but warn first. */
function openPay(r: SaleRow): void {
    if (!refunded(r)) { showPayModal(r); return; }
    POP.confirm({ title: tr("PAY"), content: tr("PAY_RETURN_WARN"), okBtn: { btnText: tr("PAY"), onClick: () => showPayModal(r) } });
}
function showPayModal(sale: SaleRow): void {
    POP.showPopup(InvoicePayModal, { title: t("SIV13100.TITLE"), props: { sale } }).promise.then(reload).catch(() => undefined);
}
</script>

<style scoped>
.siv_chips { display: flex; flex-wrap: wrap; gap: 4px; padding: 0 8px 8px; }
.siv_total { display: flex; justify-content: space-between; padding: 8px 16px 0; font-size: 12px; color: var(--ion-color-medium); }
.siv_total strong { color: var(--ion-color-primary); }
.siv_sums { margin: 2px 16px 0; font-size: 10px; color: var(--ion-color-medium); }
.siv_code { font-size: 10px; letter-spacing: .3px; }
.siv_by { font-size: 10px; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
.siv_badges { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
</style>
