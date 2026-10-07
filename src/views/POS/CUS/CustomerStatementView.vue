<template>
	<div>
		<div class="csv_cards">
			<div class="csv_card">
				<p>{{ tr("INVOICED") }}</p>
				<b>{{ money(report.totalInvoicesAmount) }}</b>
				<small>{{ report.totalInvoicesCount }} {{ tr("INVOICES") }}</small>
			</div>
			<div class="csv_card">
				<p>{{ tr("PAID") }}</p>
				<b>{{ money(report.totalPaidAmount) }}</b>
			</div>
			<div class="csv_card">
				<p>{{ tr("RETURNS") }}</p>
				<b>{{ money(report.totalReturnsAmount) }}</b>
				<small>{{ report.totalReturnsCount }} {{ tr("RETURNS_COUNT") }}</small>
			</div>
			<div class="csv_card csv_net">
				<p>{{ tr("NET_BALANCE") }}</p>
				<b>{{ money(report.netBalance) }}</b>
				<small>{{ tr("OUTSTANDING") }}: {{ money(report.totalOutstandingAmount) }}</small>
			</div>
		</div>

		<ion-list class="scr_list" lines="full">
			<ion-item v-for="(row, i) in report.ledger ?? []" :key="`${row.code}${i}`">
				<ion-label>
					<p>{{ String(row.date ?? "").slice(0, 10) }} · {{ typeLabel(row.type) }}</p>
					<h3>{{ row.code }}</h3>
					<p v-if="row.reference">{{ row.reference }}</p>
				</ion-label>
				<div slot="end" class="csv_end">
					<b>{{ money(row.amount) }}</b>
					<ion-badge :color="statusColor(row)">{{ statusLabel(row) }}</ion-badge>
				</div>
			</ion-item>
		</ion-list>
	</div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import UT from "@/core/utilities/ut";
import type { CUS17000Response, StatementLedgerRow } from "@/models/POS/CUS/CUS17000";

/** Customer balance statement (summary cards + merged ledger); shared by CUS17000 and the CUS14000 tab. */
defineOptions({ name: "CustomerStatementView" });

defineProps<{ report: CUS17000Response }>();
const { t } = useI18n();
const tr = (key: string) => t(`CUS17000.${key}`);
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");
const typeLabel = (type?: string) => tr(type === "RETURN" ? "TYPE_RETURN" : "TYPE_INVOICE");

function statusLabel(row: StatementLedgerRow): string {
	const k = String(row.status ?? "").toUpperCase();
	if (row.type === "RETURN") return ["APPROVED", "PENDING", "REJECTED"].includes(k) ? tr("RET_" + k) : String(row.status ?? "");
	return ["PAID", "PARTIAL", "UNPAID", "CANCELLED"].includes(k) ? tr("PAY_" + k) : String(row.status ?? "");
}
function statusColor(row: StatementLedgerRow): string {
	const k = String(row.status ?? "").toUpperCase();
	if (row.type === "RETURN") return k === "APPROVED" ? "success" : "medium";
	if (k === "PAID") return "success";
	return k === "PARTIAL" ? "warning" : "medium";
}
</script>

<style scoped>
.csv_cards { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 8px 16px; }
.csv_card { border: 1px solid #e5e5ea; border-radius: 8px; padding: 8px 12px;
	p { margin: 0; font-size: 12px; color: #6b6b76; }
	b { display: block; font-size: 16px; }
	small { font-size: 10px; color: #6b6b76; }
}
.csv_net b { color: var(--ion-color-primary); }
.csv_end { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; font-size: 14px; }
</style>
