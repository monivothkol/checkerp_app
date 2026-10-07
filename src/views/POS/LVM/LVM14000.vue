<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/LVM10000" />
		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<template v-else-if="store.header">
				<ion-list class="scr_list" lines="full">
					<ion-item>
						<ion-label><p>{{ tr("STAFF") }}</p><h3>{{ store.header.staffName }} <span class="lvm_code">{{ store.header.staffCode }}</span></h3></ion-label>
						<ion-badge slot="end" :color="statusColor(store.header.status)">{{ tr("STATUS_" + store.header.status) }}</ion-badge>
					</ion-item>
					<ion-item><ion-label><p>{{ tr("TYPE") }}</p><h3>{{ store.header.leaveTypeName }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("DATES") }}</p><h3>{{ store.header.startDate }} → {{ store.header.endDate }}</h3></ion-label></ion-item>
					<ion-item>
						<ion-label><p>{{ tr("DAYS") }}</p><h3><strong>{{ store.header.totalDays }}</strong></h3></ion-label>
						<ion-badge v-if="store.header.isHalfDay" slot="end" color="tertiary">{{ tr("HALF_DAY") }}</ion-badge>
					</ion-item>
					<ion-item v-if="store.header.reason"><ion-label class="ion-text-wrap"><p>{{ tr("REASON") }}</p><h3>{{ store.header.reason }}</h3></ion-label></ion-item>
					<ion-item v-if="store.header.rejectionReason"><ion-label class="ion-text-wrap" color="danger"><p>{{ tr("REJECTION_REASON") }}</p><h3>{{ store.header.rejectionReason }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("CREATED_AT") }}</p><h3>{{ fmtDate(store.header.createdAt) }}</h3></ion-label></ion-item>
				</ion-list>

				<ion-list class="scr_list" lines="full">
					<ion-list-header>{{ tr("APPROVAL_LINE") }}</ion-list-header>
					<ion-item v-for="a in store.approvals" :key="a.stepOrder" :class="{ lvm_current: a.isCurrent }">
						<ion-badge slot="start" :color="stepColor(a)">{{ a.stepOrder }}</ion-badge>
						<ion-label class="ion-text-wrap">
							<h3>{{ a.approverName }} <span class="lvm_code">{{ a.approverCode }}</span></h3>
							<p v-if="a.actedAt">{{ fmtDate(a.actedAt) }}</p>
							<p v-if="a.comment">{{ a.comment }}</p>
						</ion-label>
						<div slot="end" class="lvm_step_tags">
							<ion-badge :color="statusColor(a.status)">{{ tr("STATUS_" + a.status) }}</ion-badge>
							<ion-badge v-if="a.isCurrent" color="tertiary">{{ tr("CURRENT_STEP") }}</ion-badge>
						</div>
					</ion-item>
					<ion-item v-if="!store.approvals.length"><ion-note>{{ tr("NO_APPROVERS") }}</ion-note></ion-item>
				</ion-list>

				<div v-if="store.followers.length" class="lvm_chips">
					<p>{{ tr("FOLLOWERS") }}</p>
					<ion-chip v-for="f in store.followers" :key="f.staffCode">{{ f.staffName }} · {{ f.staffCode }}</ion-chip>
				</div>
			</template>
			<bm-empty-state v-else description="LVM14000.NOT_FOUND" />
		</ion-content>

		<ion-footer v-if="store.header && store.header.status === 'PENDING'">
			<ion-toolbar>
				<div class="lvm_btns">
					<ion-button fill="outline" :disabled="store.acting" @click="onCancel">{{ tr("CANCEL_REQUEST") }}</ion-button>
					<ion-button color="danger" :disabled="store.acting" @click="onReject">{{ tr("REJECT") }}</ion-button>
					<ion-button :disabled="store.acting" @click="onApprove">{{ tr("APPROVE") }}</ion-button>
				</div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import type { RefresherCustomEvent } from "@ionic/vue";
import POP from "@/core/utilities/pop";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { LVM14000Store } from "@/store/POS/LVM/LVM14000Store";
import LeaveRejectModal from "@/views/POS/LVM/LeaveRejectModal.vue";
import type { LeaveApproval } from "@/models/POS/LVM/LVM10000";

/** Leave request detail: approval line steps, followers; PENDING → approve / reject / cancel. */
defineOptions({ name: "LVM14000" });

const { t } = useI18n();
const route = useRoute();
const tr = (k: string) => t(`LVM14000.${k}`);
const store = LVM14000Store();

const load = () => store.load(String(route.query.requestId ?? ""));
useViewEnter(load);
async function onRefresh(ev: RefresherCustomEvent): Promise<void> { load(); await ev.target.complete(); }

const fmtDate = (d?: string) => (d ? String(d).replace("T", " ").slice(0, 16) : "—");
function statusColor(s?: string): string {
	if (s === "APPROVED") return "success";
	return s === "REJECTED" ? "danger" : "medium";
}
function stepColor(a: LeaveApproval): string {
	if (a.status === "APPROVED") return "success";
	if (a.status === "REJECTED") return "danger";
	return a.isCurrent ? "primary" : "light";
}
function onActDone(ok: boolean, error?: unknown): void {
	if (!ok) POP.apiError(error as { code?: string; message?: string } | undefined, tr("ACT_FAILED"));
}
function onApprove(): void {
	POP.confirm({
		title: tr("APPROVE_TITLE"),
		content: `${store.header?.staffName ?? ""} — ${store.header?.totalDays} ${tr("DAYS")}`,
		okBtn: { btnText: tr("APPROVE"), onClick: () => store.approve(undefined, onActDone) }
	});
}
function onReject(): void {
	POP.showPopup<string | undefined>(LeaveRejectModal, { title: tr("REJECT_TITLE") }).promise
		.then((res) => store.reject(res.data, onActDone))
		.catch(() => undefined);
}
function onCancel(): void {
	POP.confirm({ title: tr("CANCEL_TITLE"), content: tr("CANCEL_MSG"), okBtn: { btnText: tr("CANCEL_REQUEST"), onClick: () => store.cancel(onActDone) } });
}
</script>

<style scoped>
.lvm_code { font-size: 12px; color: var(--ion-color-medium); }
.lvm_current { --background: var(--ion-color-light); }
.lvm_step_tags { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.lvm_chips { padding: 8px 16px; }
.lvm_chips p { font-size: 12px; font-weight: 700; color: var(--ion-color-medium); margin: 0 0 4px; }
ion-label h3 { font-size: 14px; }
ion-label p { font-size: 12px; }
.lvm_btns { display: flex; gap: 8px; padding: 0 8px; }
.lvm_btns ion-button { flex: 1; }
</style>
