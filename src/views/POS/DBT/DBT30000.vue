<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/DBT10000">
			<template v-if="d" #bottom>
				<ion-toolbar>
					<ion-segment v-model="tab">
						<ion-segment-button value="info"><ion-label>{{ tr("TERMS") }}</ion-label></ion-segment-button>
						<ion-segment-button value="schedule"><ion-label>{{ tr("SCHEDULE") }}</ion-label></ion-segment-button>
						<ion-segment-button value="payments"><ion-label>{{ tr("PAYMENTS") }}</ion-label></ion-segment-button>
					</ion-segment>
				</ion-toolbar>
			</template>
		</bm-header>
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<template v-if="d">
				<template v-if="tab === 'info'">
					<div class="act_cards">
						<div class="act_card"><div class="act_card_label">{{ tr("OUTSTANDING") }}</div><div class="act_card_value">{{ money(d.outstanding) }}</div></div>
						<div class="act_card"><div class="act_card_label">{{ tr("MONTHLY") }}</div><div class="act_card_value">{{ money(d.monthlyPayment) }}</div></div>
						<div class="act_card"><div class="act_card_label">{{ tr("SHORT_TERM") }}</div><div class="act_card_value">{{ money(d.currentPortion) }}</div></div>
						<div class="act_card"><div class="act_card_label">{{ tr("LONG_TERM") }}</div><div class="act_card_value">{{ money(d.longTermPortion) }}</div></div>
						<div class="act_card"><div class="act_card_label">{{ tr("PRINCIPAL_PAID") }}</div><div class="act_card_value">{{ money(d.principalPaid) }}</div></div>
						<div class="act_card"><div class="act_card_label">{{ tr("INTEREST_PAID") }}</div><div class="act_card_value">{{ money(d.interestPaid) }}</div></div>
					</div>
					<ion-list class="scr_list" lines="full">
						<ion-item><ion-label><p>{{ tr("CODE") }}</p><h3>{{ d.loanCode }}</h3></ion-label>
							<ion-badge slot="end" :color="d.status === 'ACTIVE' ? 'success' : 'medium'">{{ $t(`DBT10000.${d.status}`) }}</ion-badge>
						</ion-item>
						<ion-item><ion-label class="ion-text-wrap"><p>{{ tr("LENDER") }}</p><h3>{{ d.lenderName }} · {{ $t(`DBT10000.${d.lenderType}`) }}</h3></ion-label></ion-item>
						<ion-item><ion-label><p>{{ tr("TERMS") }}</p><h3>{{ money(d.principal) }} · {{ Number(d.interestRate) }}% · {{ d.termMonths }} {{ tr("MONTHS") }}</h3></ion-label></ion-item>
						<ion-item><ion-label><p>{{ tr("START") }}</p><h3>{{ d.startDate }} · {{ $t(`DBT20000.${d.receivedTo}`) }}</h3></ion-label></ion-item>
						<ion-item><ion-label><p>{{ tr("ACCOUNT") }}</p><h3>{{ d.accountCode }}</h3></ion-label></ion-item>
						<ion-item><ion-label><p>{{ tr("REFERENCE") }}</p><h3>{{ d.referenceNo || "-" }}</h3></ion-label></ion-item>
						<ion-item><ion-label class="ion-text-wrap"><p>{{ tr("REMARK") }}</p><h3>{{ d.remark || "-" }}</h3></ion-label></ion-item>
					</ion-list>
				</template>

				<ion-list v-else-if="tab === 'schedule'" class="scr_list" lines="full">
					<ion-item v-for="r in d.scheduleList" :key="r.installmentNo">
						<ion-label>
							<p>#{{ r.installmentNo }} · {{ tr("COL_DUE") }} {{ r.dueDate }}</p>
							<p>{{ tr("COL_PRINCIPAL") }} {{ money(r.principalDue) }} · {{ tr("COL_INTEREST") }} {{ money(r.interestDue) }}</p>
							<p>{{ tr("COL_BALANCE") }} {{ money(r.balanceAfter) }}</p>
						</ion-label>
						<div slot="end" class="dbt_end">
							<span class="act_amt act_bold">{{ money(r.paymentDue) }}</span>
							<ion-badge v-if="r.status" :color="statusColor(r.status)">{{ tr(r.status) }}</ion-badge>
						</div>
					</ion-item>
				</ion-list>

				<template v-else>
					<ion-list v-if="d.paymentList?.length" class="scr_list" lines="full">
						<ion-item v-for="p in d.paymentList" :key="p.paymentId">
							<ion-label>
								<p>{{ p.paymentDate }} · {{ $t(`DBT20000.${p.paidFrom}`) }}<span v-if="p.referenceNo"> · {{ p.referenceNo }}</span></p>
								<p>{{ tr("COL_PRINCIPAL") }} {{ money(p.principalAmount) }} · {{ tr("COL_INTEREST") }} {{ money(p.interestAmount) }}</p>
							</ion-label>
							<span slot="end" class="act_amt act_bold">{{ money(p.totalAmount) }}</span>
						</ion-item>
					</ion-list>
					<bm-empty-state v-else />
				</template>
			</template>
			<bm-empty-state v-else-if="!store.loading" description="DBT30000.NOT_FOUND" />
		</ion-content>
		<ion-footer v-if="d?.status === 'ACTIVE'">
			<ion-toolbar>
				<div class="act_btns"><ion-button @click="onRepay">{{ tr("RECORD_PAYMENT") }}</ion-button></div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import UT from "@/core/utilities/ut";
import POP from "@/core/utilities/pop";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { DBT30000Store } from "@/store/POS/DBT/DBT30000Store";
import LoanRepaymentModal from "@/views/POS/DBT/LoanRepaymentModal.vue";

/** Loan detail: terms + balances, schedule and payments tabs; an ACTIVE loan takes repayments. */
defineOptions({ name: "DBT30000" });

const { t } = useI18n();
const tr = (k: string) => t(`DBT30000.${k}`);
const route = useRoute();
const store = DBT30000Store();
const d = computed(() => store.detail);
const tab = ref("info");
const money = (v: unknown) => "$ " + UT.currency(Number(v ?? 0), "USD");
const statusColor = (s: string) => (s === "PAID" ? "success" : s === "OVERDUE" ? "danger" : "medium");

useViewEnter(() => store.load(String(route.query.loanId ?? "")));

function onRepay(): void {
	POP.showPopup(LoanRepaymentModal, { title: tr("RECORD_PAYMENT") }).promise.then(() => store.load(store.loanId)).catch(() => undefined);
}
</script>

<style scoped src="../../ACT/act-report.css"></style>
<style scoped>
.dbt_end { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
</style>
