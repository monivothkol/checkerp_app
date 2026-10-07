<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/RPT80000" />
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<template v-if="store.detail">
				<ion-list class="scr_list" lines="full">
					<ion-item>
						<ion-label><p>{{ tr("CODE") }}</p><h3 class="r82_value">{{ d.commissionCode }}</h3></ion-label>
						<ion-badge slot="end" :color="statusColor(d.status)">{{ tr("STATUS_" + d.status) }}</ion-badge>
					</ion-item>
					<ion-item><ion-label><p>{{ tr("PERIOD") }}</p><h3 class="r82_value">{{ d.startDate }} → {{ d.endDate }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("CRITERIA") }}</p><h3 class="r82_value">{{ label(d.criteriaType) }} · {{ money(d.criteriaValue) }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("INPUT") }}</p><h3 class="r82_value">{{ label(d.inputType) }} {{ d.inputValue }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("BASIS") }}</p><h3 class="r82_value">{{ tr("BASIS_" + (d.payoutBasis || d.distributionType || "EQUAL_SPLIT")) }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("TOTAL") }}</p><h3 class="r82_value"><b>{{ money(d.totalCommissionAmount) }}</b></h3></ion-label></ion-item>
					<ion-item v-if="d.rejectionReason"><ion-label><p>{{ tr("REASON") }}</p><h3 class="r82_value">{{ d.rejectionReason }}</h3></ion-label></ion-item>
				</ion-list>

				<ion-list class="scr_list" lines="full">
					<ion-list-header>{{ tr("RECIPIENTS") }}</ion-list-header>
					<ion-item v-for="(r, i) in d.recipients ?? []" :key="r.recipientId ?? i">
						<ion-label>
							<h3>{{ r.recipientName }}</h3>
							<p>{{ r.department ?? "—" }} · {{ tr("COL_SHARE") }} {{ r.sharePercentage }}%</p>
						</ion-label>
						<div slot="end" class="r82_end">
							<b>{{ money(r.commissionAmount) }}</b>
							<ion-badge :color="r.paymentStatus === 'PAID' ? 'success' : 'medium'">{{ r.paymentStatus }}</ion-badge>
						</div>
					</ion-item>
				</ion-list>
			</template>
			<bm-empty-state v-else-if="!store.loading" description="RPT82000.NOT_FOUND" />
		</ion-content>
		<ion-footer v-if="store.detail?.status === 'PENDING'">
			<ion-toolbar class="r82_btns">
				<ion-button color="danger" fill="outline" :disabled="store.acting" @click="onReject">{{ tr("REJECT") }}</ion-button>
				<ion-button :disabled="store.acting" @click="onApprove">{{ tr("APPROVE") }}</ion-button>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import POP from "@/core/utilities/pop";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { RPT82000Store } from "@/store/POS/RPT/RPT82000Store";
import type { CommissionActionResponse, CommissionDetail } from "@/models/POS/RPT/RPT80000";

/** Commission detail: header + recipients; a PENDING commission can be approved or rejected. */
defineOptions({ name: "RPT82000" });

const { t, te } = useI18n();
const route = useRoute();
const tr = (key: string) => t(`RPT82000.${key}`);
const store = RPT82000Store();
const d = computed(() => store.detail as CommissionDetail);
const money = (v: unknown) => "$ " + UT.currency(Number(v ?? 0), "USD");
const label = (v?: string) => (!v ? "—" : te(`RPT80000.T_${v}`) ? t(`RPT80000.T_${v}`) : v);

function statusColor(s?: string): string {
	if (s === "APPROVED") return "success";
	return s === "REJECTED" ? "danger" : "medium";
}
function done(okKey: string) {
	return (ok: boolean, _res?: CommissionActionResponse, error?: unknown): void => {
		if (ok) POP.alert({ status: "success", title: tr("DONE"), content: tr(okKey) });
		else POP.apiError(error as { code?: string; message?: string } | undefined, tr("ACTION_FAILED"));
	};
}
function onApprove(): void {
	POP.confirm({ title: tr("APPROVE_TITLE"), content: tr("APPROVE_MSG"),
		okBtn: { btnText: tr("APPROVE"), onClick: () => store.approve(done("APPROVED_MSG")) } });
}
function onReject(): void {
	POP.confirm({ title: tr("REJECT_TITLE"), content: tr("REJECT_MSG"),
		okBtn: { btnText: tr("REJECT"), onClick: () => store.reject("Rejected", done("REJECTED_MSG")) } });
}

useViewEnter(() => store.load(String(route.query.commissionId ?? "")));
</script>

<style scoped>
.r82_value { font-size: 14px; white-space: normal; }
.r82_end { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; font-size: 14px; }
.r82_btns { --padding-start: 16px; --padding-end: 16px; }
.r82_btns ion-button { width: calc(50% - 4px); }
</style>
