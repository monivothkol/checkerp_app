<template>
	<div class="ps">
		<div class="ps_head">
			<div><span>{{ tr("STAFF") }}</span>{{ detail.staffName ?? "—" }} ({{ detail.staffCode ?? "—" }})</div>
			<div><span>{{ tr("BASIC") }}</span>{{ money(detail.basicSalary) }}</div>
			<div><span>{{ tr("DAYS") }}</span>{{ detail.workingDaysUsed ?? "—" }}</div>
			<div><span>{{ tr("RATE") }}</span>{{ money(detail.dailyRate) }}</div>
		</div>
		<h2>{{ tr("EARNINGS") }}</h2>
		<table><tbody>
			<tr v-for="(l, i) in earnings" :key="`e${i}`"><td>{{ l.label }}</td><td class="num">{{ money(l.amount) }}</td></tr>
			<tr v-if="!earnings.length"><td colspan="2" class="ctr">—</td></tr>
		</tbody></table>
		<h2>{{ tr("DEDUCTIONS") }}</h2>
		<table><tbody>
			<tr v-for="(l, i) in deductions" :key="`d${i}`"><td>{{ l.label }}</td><td class="num">{{ money(l.amount) }}</td></tr>
			<tr v-if="!deductions.length"><td colspan="2" class="ctr">—</td></tr>
		</tbody></table>
		<div class="ps_net"><span>{{ tr("NET") }}</span><strong>{{ money(detail.netSalary) }}</strong></div>
		<ion-button v-if="canPrint" expand="block" class="ps_print" @click="print">{{ tr("PRINT") }}</ion-button>
	</div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import UT from "@/core/utilities/ut";
import { BizCheckMobileDevice } from "@/shared/bizcheckmobile";
import type { PayslipItem, PayslipLine } from "@/models/POS/PRM/PRM15000";

/** Printable payslip (PRM15000 "Export payslip"); Print uses the system print dialog. */
defineOptions({ name: "PayslipDocument" });

const props = defineProps<{ detail: PayslipItem; earnings: PayslipLine[]; deductions: PayslipLine[] }>();
defineEmits<{ ok: []; cancel: [] }>();
const { t } = useI18n();
const tr = (k: string) => t(`PRM15000.${k}`);

function money(v: unknown): string {
	const cur = props.detail.currency ?? "USD";
	return `${cur === "KHR" ? "៛" : "$"} ${UT.currency(Number(v ?? 0), cur)}`;
}
// window.print() does nothing inside the native WebView.
const canPrint = !BizCheckMobileDevice.isApp(); // no print gateway in the native shell yet
const print = () => window.print();
</script>

<style scoped>
.ps { color: #16192c; }
.ps h2 { font-size: 14px; margin: 16px 0 8px; }
.ps_head { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; font-size: 14px; }
.ps_head span { display: block; color: #6E7180; text-transform: uppercase; font-size: 10px; }
table { width: 100%; border-collapse: collapse; }
td { padding: 4px 8px; border-bottom: 1px solid #eee; font-size: 12px; }
td.num { text-align: right; }
td.ctr { text-align: center; color: #999; }
.ps_net { display: flex; justify-content: space-between; margin-top: 16px; padding: 12px; background: #f4f5fb; font-size: 16px; font-weight: 700; }
.ps_print { margin-top: 16px; }
@media print { .ps_print { display: none; } }
</style>
