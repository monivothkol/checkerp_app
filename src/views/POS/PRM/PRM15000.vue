<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/PRM10000">
			<template v-if="store.detail" #end>
				<ion-button @click="exportPayslip"><ion-icon slot="icon-only" :icon="printOutline" /></ion-button>
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<template v-else-if="store.detail">
				<ion-list class="scr_list" lines="full">
					<ion-item><ion-label><p>{{ tr("STAFF") }}</p><h3>{{ store.detail.staffName }} <span class="prm_code">{{ store.detail.staffCode }}</span></h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("BASIC") }}</p><h3>{{ money(store.detail.basicSalary) }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("DAYS") }}</p><h3>{{ store.detail.workingDaysUsed }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("RATE") }}</p><h3>{{ money(store.detail.dailyRate) }}</h3></ion-label></ion-item>
					<ion-item v-if="isFinalized">
						<ion-label>
							<p>{{ tr("STATUS") }}</p>
							<div class="prm_flags">
								<ion-badge :color="store.detail.isVerified ? 'success' : 'medium'">{{ store.detail.isVerified ? tr("VERIFIED") : tr("UNVERIFIED") }}</ion-badge>
								<ion-badge :color="store.detail.isPaid ? 'success' : 'medium'">{{ store.detail.isPaid ? tr("PAID") : tr("UNPAID") }}</ion-badge>
								<span v-if="store.detail.paidAt" class="prm_date">{{ String(store.detail.paidAt).slice(0, 10) }}</span>
							</div>
						</ion-label>
					</ion-item>
				</ion-list>

				<ion-list class="scr_list" lines="full">
					<ion-list-header>{{ tr("EARNINGS") }}</ion-list-header>
					<ion-item-sliding v-for="l in store.earnings" :key="String(l.lineId)">
						<ion-item>
							<ion-label>
								<h3>{{ l.label }}</h3>
								<p>{{ tr("COL_SOURCE") }}: {{ l.source ?? "—" }}</p>
							</ion-label>
							<ion-note slot="end" class="prm_amt">{{ money(l.amount) }}</ion-note>
						</ion-item>
						<ion-item-options v-if="l.commissionId || canRemove(l)" side="end">
							<ion-item-option v-if="l.commissionId" color="tertiary" @click="onViewCommission(l)">{{ tr("VIEW_COMMISSION") }}</ion-item-option>
							<ion-item-option v-if="canRemove(l)" color="danger" @click="onRemoveLine(l)">{{ tr("REMOVE") }}</ion-item-option>
						</ion-item-options>
					</ion-item-sliding>
					<ion-item v-if="!store.earnings.length"><ion-note>—</ion-note></ion-item>
				</ion-list>

				<ion-list class="scr_list" lines="full">
					<ion-list-header>{{ tr("DEDUCTIONS") }}</ion-list-header>
					<ion-item-sliding v-for="l in store.deductions" :key="String(l.lineId)">
						<ion-item>
							<ion-label>
								<h3>{{ l.label }}</h3>
								<p>{{ tr("COL_SOURCE") }}: {{ l.source ?? "—" }}</p>
								<p v-if="l.accountBalance != null" class="prm_balance">
									{{ tr(l.accountType === "ADVANCE" ? "ADVANCE_BALANCE" : "LOAN_BALANCE") }} {{ money(l.accountBalance) }} · {{ tr("REMAINING") }} {{ money(remaining(l)) }}
								</p>
							</ion-label>
							<ion-note slot="end" class="prm_amt">{{ money(l.amount) }}</ion-note>
						</ion-item>
						<ion-item-options v-if="canEdit(l) || canRemove(l)" side="end">
							<ion-item-option v-if="canEdit(l)" @click="onEditLine(l)">{{ tr("EDIT") }}</ion-item-option>
							<ion-item-option v-if="canRemove(l)" color="danger" @click="onRemoveLine(l)">{{ tr("REMOVE") }}</ion-item-option>
						</ion-item-options>
					</ion-item-sliding>
					<ion-item v-if="!store.deductions.length"><ion-note>—</ion-note></ion-item>
				</ion-list>

				<div class="prm_net">
					<span>{{ tr("NET") }}</span>
					<strong>{{ money(store.detail.netSalary) }}</strong>
				</div>
			</template>
			<bm-empty-state v-else description="PRM15000.NOT_FOUND" />
		</ion-content>

		<ion-footer v-if="store.detail && (isDraft || isFinalized)">
			<ion-toolbar>
				<div class="prm_btns">
					<ion-button v-if="isDraft" @click="onAddLine">{{ tr("ADD_LINE") }}</ion-button>
					<template v-if="isFinalized">
						<ion-button fill="outline" :disabled="marking" @click="onToggleVerified">{{ store.detail.isVerified ? tr("UNVERIFY") : tr("VERIFY") }}</ion-button>
						<ion-button :disabled="marking" @click="onTogglePaid">{{ store.detail.isPaid ? tr("MARK_UNPAID") : tr("MARK_PAID") }}</ion-button>
					</template>
				</div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import type { RefresherCustomEvent } from "@ionic/vue";
import { printOutline } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { PRM15000Store } from "@/store/POS/PRM/PRM15000Store";
import PRM16000 from "@/views/POS/PRM/PRM16000.vue";
import PRM19000 from "@/views/POS/PRM/PRM19000.vue";
import CommissionDetailModal from "@/views/POS/PRM/CommissionDetailModal.vue";
import PayslipDocument from "@/views/POS/PRM/PayslipDocument.vue";
import type { PayslipLine } from "@/models/POS/PRM/PRM15000";

/** Payslip: lines, DRAFT add/edit/remove, FINALIZED verify/pay marks, printable payslip. */
defineOptions({ name: "PRM15000" });

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const tr = (k: string) => t(`PRM15000.${k}`);
const store = PRM15000Store();
const marking = ref(false);

const isDraft = computed(() => store.detail?.runStatus === "DRAFT");
const isFinalized = computed(() => store.detail?.runStatus === "FINALIZED");

const load = () => store.load(String(route.query.itemId ?? ""));
useViewEnter(load);
async function onRefresh(ev: RefresherCustomEvent): Promise<void> { load(); await ev.target.complete(); }

function money(v: unknown): string {
	const cur = store.detail?.currency ?? "USD";
	return `${cur === "KHR" ? "៛" : "$"} ${UT.currency(Number(v ?? 0), cur)}`;
}
/** Balance left on the loan/advance after this payslip's recovery. */
const remaining = (l: PayslipLine) => Number(l.accountBalance ?? 0) - Number(l.amount ?? 0);
// A recovery line can be edited only while its run is still a draft.
const canEdit = (l: PayslipLine) => l.source === "FINANCIAL" && !!l.editable && isDraft.value;
// Only hand-added lines (manual adjustment / applied commission) can be removed, on a draft.
const canRemove = (l: PayslipLine) => (l.source === "MANUAL" || l.source === "COMMISSION") && isDraft.value;

function exportPayslip(): void {
	if (!store.detail) return;
	POP.showPopup(PayslipDocument, {
		title: tr("EXPORT_PAYSLIP"),
		props: { detail: store.detail, earnings: store.earnings, deductions: store.deductions }
	}).promise.catch(() => undefined);
}
function onEditLine(l: PayslipLine): void {
	POP.showPopup(PRM19000, {
		title: tr("EDIT_TITLE"),
		props: { lineId: l.lineId, label: l.label, current: Number(l.amount ?? 0), balance: l.accountBalance ?? undefined }
	}).promise.then(() => store.load(store.itemId)).catch(() => undefined);
}
function onAddLine(): void {
	POP.showPopup(PRM16000, {
		title: tr("ADD_TITLE"),
		props: { runId: store.detail?.runId ?? "", staffId: store.detail?.staffId ?? "" }
	}).promise.then(() => store.load(store.itemId)).catch(() => undefined);
}
function onMarkDone(ok: boolean, error?: unknown): void {
	marking.value = false;
	if (!ok) {
		const e = error as { message?: string; code?: string } | undefined;
		POP.apiError(e, tr("MARK_FAILED"));
	}
}
function onToggleVerified(): void {
	marking.value = true;
	store.markVerified(!store.detail?.isVerified, onMarkDone);
}
function onTogglePaid(): void {
	const paying = !store.detail?.isPaid;
	POP.confirm({
		title: paying ? tr("PAY_TITLE") : tr("UNPAY_TITLE"),
		content: `${store.detail?.staffName ?? ""} — ${money(store.detail?.netSalary)}`,
		okBtn: { btnText: paying ? tr("MARK_PAID") : tr("MARK_UNPAID"), onClick: () => { marking.value = true; store.markPaid(paying, onMarkDone); } }
	});
}
/** COMMISSION earning line → the source commission; "ok" asks for the full screen. */
function onViewCommission(l: PayslipLine): void {
	POP.showPopup<{ commissionId?: string }>(CommissionDetailModal, {
		title: tr("VIEW_COMMISSION"),
		props: { commissionId: l.commissionId, staffId: store.detail?.staffId ?? "" }
	}).promise.then((res) => {
		const id = res.data?.commissionId;
		if (id) router.push(`/RPT82000?commissionId=${encodeURIComponent(id)}`);
	}).catch(() => undefined);
}
function onRemoveLine(l: PayslipLine): void {
	POP.confirm({
		title: tr("REMOVE_TITLE"),
		content: `${l.label} — ${money(l.amount)}`,
		okBtn: {
			btnText: tr("REMOVE"),
			onClick: () => store.removeLine(String(l.lineId ?? ""), (ok, error) => {
				if (!ok) {
					const e = error as { message?: string; code?: string } | undefined;
					POP.apiError(e, tr("REMOVE_FAILED"));
				}
			})
		}
	});
}
</script>

<style scoped>
.prm_code { font-size: 12px; color: var(--ion-color-medium); }
.prm_flags { display: flex; align-items: center; gap: 4px; margin-top: 4px; }
.prm_date { font-size: 12px; color: var(--ion-color-medium); }
.prm_amt { font-size: 14px; color: var(--ion-color-dark); }
.prm_balance { color: var(--ion-color-medium); }
.prm_net { display: flex; justify-content: space-between; align-items: center; margin: 16px; padding: 12px 16px; border-radius: 8px; background: var(--ion-color-primary-tint); color: var(--ion-color-primary-contrast); font-size: 16px; font-weight: 700; }
.prm_btns { display: flex; gap: 8px; padding: 0 8px; }
.prm_btns ion-button { flex: 1; }
ion-label h3 { font-size: 14px; }
ion-label p { font-size: 12px; }
</style>
