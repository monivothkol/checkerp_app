<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu" />
		<ion-content>
			<ion-searchbar :placeholder="tr('SEL_SUPPLIER')" @ion-input="store.onSupplierSearch(String($event.detail.value ?? ''))" />
			<ion-list class="scr_list" lines="full">
				<ion-item>
					<ion-select v-model="store.supplierId" :label="tr('SEL_SUPPLIER')" label-placement="stacked" interface="action-sheet" @ion-change="load">
						<ion-select-option v-for="s in store.suppliers" :key="s.supplierId" :value="s.supplierId">{{ supplierLabel(s) }}</ion-select-option>
					</ion-select>
				</ion-item>
				<ion-item><ion-input v-model="from" type="date" :label="`${tr('COL_DATE')} ▸`" label-placement="stacked" /></ion-item>
				<ion-item><ion-input v-model="to" type="date" :label="`${tr('COL_DATE')} ◂`" label-placement="stacked" /></ion-item>
			</ion-list>
			<div class="s17_btns">
				<ion-button size="small" :disabled="!store.supplierId" @click="load">{{ tr("APPLY") }}</ion-button>
			</div>

			<template v-if="store.report">
				<ReportCards :cards="cards" />
				<ion-list class="scr_list" lines="full">
					<ion-list-header>{{ tr("BILLS_TITLE") }}</ion-list-header>
					<ion-item v-for="b in store.report.bills ?? []" :key="b.adjustmentId ?? b.billCode">
						<ion-label>
							<p>{{ String(b.billDate ?? "").slice(0, 10) }}<template v-if="b.poCode"> · {{ tr("COL_PO") }} {{ b.poCode }}</template></p>
							<h3>{{ b.billCode }}</h3>
							<p>{{ tr("COL_PAID") }}: {{ cur(b.paidAmount) }} · {{ tr("COL_OUTSTANDING") }}: {{ cur(b.outstandingAmount) }}</p>
						</ion-label>
						<div slot="end" class="s17_end">
							<b>{{ cur(b.grandTotal) }}</b>
							<ion-badge :color="payColor(b)">{{ payLabel(b) }}</ion-badge>
						</div>
					</ion-item>
				</ion-list>
				<ion-list v-if="store.report.purchaseReturns?.length" class="scr_list" lines="full">
					<ion-list-header>{{ tr("RETURNS_TITLE") }}</ion-list-header>
					<ion-item v-for="r in store.report.purchaseReturns" :key="r.adjustmentId ?? r.returnCode">
						<ion-label>
							<p>{{ String(r.returnedAt ?? "").slice(0, 10) }}<template v-if="r.poCode"> · {{ tr("COL_PO") }} {{ r.poCode }}</template></p>
							<h3>{{ r.returnCode }}</h3>
						</ion-label>
						<div slot="end" class="s17_end">
							<b>{{ cur(r.returnAmount) }}</b>
							<ion-badge :color="r.status === 'APPROVED' ? 'success' : 'medium'">{{ retLabel(r.status) }}</ion-badge>
						</div>
					</ion-item>
				</ion-list>
			</template>
			<bm-empty-state v-else-if="store.supplierId === undefined" description="SUP17000.PICK_HINT" />
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { SUP17000Store } from "@/store/POS/SUP/SUP17000Store";
import ReportCards from "@/views/POS/RPT/ReportCards.vue";
import type { SupplierLookup } from "@/models/POS/COMMON/lookups";
import type { BalanceBill } from "@/models/POS/SUP/SUP17000";

/** Supplier balance statement: bills + purchase returns for one supplier and period. */
defineOptions({ name: "SUP17000" });

const { t } = useI18n();
const tr = (key: string) => t(`SUP17000.${key}`);
const store = SUP17000Store();
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");
// Table cells in the web are plain Currency columns (no "$" prefix).
const cur = (v: unknown) => UT.currency((v as string | number) ?? 0, "USD");

const from = computed({ get: () => store.range[0] ?? "", set: (v: string) => { store.range = [v, store.range[1] ?? ""]; } });
const to = computed({ get: () => store.range[1] ?? "", set: (v: string) => { store.range = [store.range[0] ?? "", v]; } });

const cards = computed(() => {
	const r = store.report;
	if (!r) return [];
	return [
		{ label: tr("BILLED"), value: money(r.totalBillsAmount), hint: `${r.totalBillsCount ?? 0} ${tr("BILLS")}` },
		{ label: tr("PAID"), value: money(r.totalPaidAmount) },
		{ label: tr("RETURNS"), value: money(r.totalReturnsAmount), hint: `${r.totalReturnsCount ?? 0} ${tr("RETURNS_COUNT")}` },
		{ label: tr("NET_BALANCE"), value: money(r.netBalance), hint: `${tr("OUTSTANDING")}: ${money(r.totalOutstandingAmount)}`, tone: "primary" as const }
	];
});

function supplierLabel(s: SupplierLookup): string {
	const name = s.supplierName || s.contactName || s.supplierCode || "";
	return s.supplierCode ? `${name} (${s.supplierCode})` : name;
}
/** Payment state derived from outstanding/paid (bills carry no payment status). */
function payColor(b: BalanceBill): string {
	if ((b.outstandingAmount ?? 0) <= 0) return "success";
	return (b.paidAmount ?? 0) > 0 ? "warning" : "medium";
}
function payLabel(b: BalanceBill): string {
	if ((b.outstandingAmount ?? 0) <= 0) return tr("PAY_PAID");
	return tr((b.paidAmount ?? 0) > 0 ? "PAY_PARTIAL" : "PAY_UNPAID");
}
function retLabel(s?: string): string {
	const k = String(s ?? "").toUpperCase();
	return ["APPROVED", "PENDING", "REJECTED", "DRAFT"].includes(k) ? tr("RET_" + k) : String(s ?? "");
}
function load(): void {
	store.load(tr("LOAD_FAILED"));
}
useViewEnter(() => store.searchSuppliers(""));
</script>

<style scoped>
.s17_btns { display: flex; gap: 8px; padding: 8px 16px; }
.s17_end { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; font-size: 14px; }
ion-label h3 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
