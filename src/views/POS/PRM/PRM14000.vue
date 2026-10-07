<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/PRM10000" />

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<template v-else-if="store.run">
				<ion-list class="scr_list" lines="full">
					<ion-item>
						<ion-label><p>{{ tr("MONTH") }}</p><h3>{{ store.run.periodMonth }}</h3></ion-label>
						<ion-badge slot="end" :color="statusColor(store.run.status)">{{ tr("STATUS_" + store.run.status) }}</ion-badge>
					</ion-item>
					<ion-item><ion-label><p>{{ tr("DEPARTMENT") }}</p><h3>{{ store.run.departmentName || tr("ALL_DEPARTMENTS") }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("EMPLOYEES") }}</p><h3>{{ store.run.employeeCount ?? store.items.length }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("GROSS") }}</p><h3>{{ money(store.run.totalGross) }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("DEDUCTION") }}</p><h3>{{ money(store.run.totalDeduction) }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("NET") }}</p><h3><strong>{{ money(store.run.totalNet) }}</strong></h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("CREATED") }}</p><h3>{{ String(store.run.createdAt ?? "").slice(0, 10) }}</h3></ion-label></ion-item>
					<ion-item v-if="store.run.finalizedAt"><ion-label><p>{{ tr("FINALIZED") }}</p><h3>{{ String(store.run.finalizedAt).slice(0, 10) }}</h3></ion-label></ion-item>
				</ion-list>

				<ion-list class="scr_list" lines="full">
					<ion-list-header>{{ tr("ITEMS") }}</ion-list-header>
					<ion-item v-for="it in store.items" :key="it.itemId" button :detail="true" @click="openItem(it.itemId)">
						<ion-label>
							<p class="prm_code">{{ it.staffCode }}</p>
							<h2>{{ it.staffName }}</h2>
							<p>{{ tr("COL_BASIC") }}: {{ money(it.basicSalary) }} · {{ tr("COL_DAYS") }}: {{ it.workingDaysUsed ?? "—" }} · {{ tr("COL_RATE") }}: {{ money(it.dailyRate) }}</p>
							<p>{{ tr("COL_EARNINGS") }}: {{ money(it.totalEarnings) }} · {{ tr("COL_DEDUCTIONS") }}: {{ money(it.totalDeductions) }}</p>
							<p><strong>{{ tr("COL_NET") }}: {{ money(it.netSalary) }}</strong></p>
							<div class="prm_flags">
								<ion-badge :color="it.isVerified ? 'success' : 'medium'">{{ it.isVerified ? tr("VERIFIED") : tr("UNVERIFIED") }}</ion-badge>
								<ion-badge :color="it.isPaid ? 'success' : 'medium'">{{ it.isPaid ? tr("PAID") : tr("UNPAID") }}</ion-badge>
							</div>
						</ion-label>
					</ion-item>
				</ion-list>
				<bm-empty-state v-if="!store.items.length" />
			</template>
			<bm-empty-state v-else description="PRM14000.NOT_FOUND" />
		</ion-content>

		<ion-footer v-if="store.run && (store.run.status === 'DRAFT' || store.run.status === 'FINALIZED')">
			<ion-toolbar>
				<div class="prm_btns">
					<template v-if="store.run.status === 'DRAFT'">
						<ion-button fill="outline" size="small" :disabled="store.acting" @click="onGenerate">{{ tr("GENERATE_FINANCIAL") }}</ion-button>
						<ion-button fill="outline" size="small" :disabled="store.acting" @click="onApplyCommission">{{ tr("APPLY_COMMISSION") }}</ion-button>
						<ion-button size="small" :disabled="store.acting" @click="onFinalize">{{ tr("FINALIZE") }}</ion-button>
					</template>
					<ion-button v-else color="danger" :disabled="store.acting" @click="onVoid">{{ tr("VOID") }}</ion-button>
				</div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import type { RefresherCustomEvent } from "@ionic/vue";
import POP from "@/core/utilities/pop";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { PRM14000Store } from "@/store/POS/PRM/PRM14000Store";
import PRM17000 from "@/views/POS/PRM/PRM17000.vue";
import type { PayrollRunActionResponse } from "@/models/POS/PRM/PRM14000";

/** Payroll run detail: header, payslip items, DRAFT generate/commission/finalize, FINALIZED void. */
defineOptions({ name: "PRM14000" });

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const tr = (k: string) => t(`PRM14000.${k}`);
const store = PRM14000Store();

const load = () => store.load(String(route.query.runId ?? ""));
useViewEnter(load);
async function onRefresh(ev: RefresherCustomEvent): Promise<void> { load(); await ev.target.complete(); }

function money(v: unknown): string {
	const cur = store.run?.currency ?? "USD";
	return `${cur === "KHR" ? "៛" : "$"} ${UT.currency(Number(v ?? 0), cur)}`;
}
function statusColor(s: string): string {
	if (s === "FINALIZED") return "success";
	return s === "VOID" ? "danger" : "medium";
}
function openItem(itemId: string): void {
	router.push(`/PRM15000?itemId=${encodeURIComponent(itemId)}`);
}
function onDone(successKey: string) {
	return (ok: boolean, _res?: PayrollRunActionResponse, error?: unknown): void => {
		if (ok) {
			POP.alert({ status: "success", title: tr("DONE"), content: tr(successKey) });
		} else {
			const e = error as { message?: string; code?: string } | undefined;
			POP.apiError(e, tr("ACTION_FAILED"));
		}
	};
}
function onGenerate(): void {
	POP.confirm({ title: tr("GENERATE_TITLE"), content: tr("GENERATE_MSG"), okBtn: { btnText: tr("GENERATE_FINANCIAL"), onClick: () => store.generateLines(onDone("GENERATED")) } });
}
function onApplyCommission(): void {
	POP.showPopup(PRM17000, { title: tr("APPLY_COMMISSION_TITLE"), props: { runId: store.runId } }).promise
		.then(() => store.load(store.runId))
		.catch(() => undefined);
}
function onFinalize(): void {
	POP.confirm({ title: tr("FINALIZE_TITLE"), content: tr("FINALIZE_MSG"), okBtn: { btnText: tr("FINALIZE"), onClick: () => store.finalize(onDone("FINALIZED_MSG")) } });
}
function onVoid(): void {
	POP.confirm({ title: tr("VOID_TITLE"), content: tr("VOID_MSG"), okBtn: { btnText: tr("VOID"), onClick: () => store.voidRun(onDone("VOIDED_MSG")) } });
}
</script>

<style scoped>
.prm_code { font-size: 12px; }
.prm_flags { display: flex; gap: 4px; margin-top: 4px; }
.prm_btns { display: flex; gap: 8px; padding: 0 8px; }
.prm_btns ion-button { flex: 1; }
ion-label h2, ion-label h3 { font-size: 14px; }
ion-label h2 { font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
