<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/DBT10000" />
		<ion-content>
			<ion-list class="scr_list" lines="full">
				<ion-item><ion-input v-model="store.lenderName" :label="`${tr('LENDER')} *`" label-placement="stacked" :placeholder="tr('LENDER_PH')" :clear-input="true" /></ion-item>
				<ion-item>
					<ion-select v-model="store.lenderType" :label="`${tr('LENDER_TYPE')} *`" label-placement="stacked" interface="action-sheet">
						<ion-select-option v-for="v in LENDER_TYPES" :key="v" :value="v">{{ $t(`DBT10000.${v}`) }}</ion-select-option>
					</ion-select>
				</ion-item>
				<ion-item>
					<NumberInput :model-value="store.principal" min="0.01" step="0.01" :precision="2" :label="`${tr('PRINCIPAL')} *`" label-placement="stacked"
						:placeholder="tr('AMOUNT_PH')" @update:model-value="(v) => { store.principal = v ?? undefined; store.onTermsChange(); }" />
				</ion-item>
				<ion-item>
					<NumberInput :model-value="store.interestRate" min="0" max="100" step="0.01" :precision="2" :label="`${tr('RATE')} (%)`" label-placement="stacked"
						@update:model-value="(v) => { store.interestRate = v ?? undefined; store.onTermsChange(); }" />
				</ion-item>
				<ion-item>
					<NumberInput :model-value="store.termMonths" min="1" max="600" step="1" integer :label="`${tr('TERM')} *`" label-placement="stacked"
						@update:model-value="(v) => { store.termMonths = v ?? undefined; store.onTermsChange(); }" />
				</ion-item>
				<ion-item>
					<ion-input :value="store.startDate" type="date" :label="`${tr('START_DATE')} *`" label-placement="stacked"
						@ion-change="store.startDate = $event.detail.value || undefined; store.onTermsChange()" />
				</ion-item>
				<ion-item>
					<ion-select v-model="store.receivedTo" :label="tr('RECEIVED_TO')" label-placement="stacked" interface="action-sheet">
						<ion-select-option v-for="v in ACCOUNTS" :key="v" :value="v">{{ tr(v) }}</ion-select-option>
					</ion-select>
				</ion-item>
				<ion-item><ion-input v-model="store.referenceNo" :label="tr('REFERENCE')" label-placement="stacked" :placeholder="tr('REFERENCE_PH')" :clear-input="true" /></ion-item>
				<ion-item><ion-textarea v-model="store.remark" :label="tr('REMARK')" label-placement="stacked" :rows="2" auto-grow /></ion-item>
			</ion-list>

			<div class="act_section">{{ tr("SCHEDULE") }}</div>
			<ion-note v-if="store.schedule.length" class="act_hint">
				{{ tr("MONTHLY") }} <b>{{ money(store.monthlyPayment) }}</b> · {{ tr("TOTAL_INTEREST") }} <b>{{ money(store.totalInterest) }}</b>
			</ion-note>
			<ion-progress-bar v-if="store.previewing" type="indeterminate" />
			<ion-list class="scr_list" lines="full">
				<ion-item v-for="r in store.schedule" :key="r.installmentNo">
					<ion-label>
						<p>#{{ r.installmentNo }} · {{ tr("COL_DUE") }} {{ r.dueDate }}</p>
						<p>{{ tr("COL_PRINCIPAL") }} {{ money(r.principalDue) }} · {{ tr("COL_INTEREST") }} {{ money(r.interestDue) }}</p>
						<p>{{ tr("COL_BALANCE") }} {{ money(r.balanceAfter) }}</p>
					</ion-label>
					<span slot="end" class="act_amt act_bold">{{ money(r.paymentDue) }}</span>
				</ion-item>
			</ion-list>
		</ion-content>
		<ion-footer>
			<ion-toolbar>
				<div class="act_btns">
					<ion-button fill="outline" @click="router.push('/DBT10000')">{{ tr("CANCEL") }}</ion-button>
					<ion-button :disabled="store.submitting" @click="onSubmit">{{ tr("RECORD") }}</ion-button>
				</div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import NumberInput from "@/core/components/NumberInput.vue";
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import UT from "@/core/utilities/ut";
import POP from "@/core/utilities/pop";
import { LENDER_TYPES } from "@/models/POS/DBT/DBT10000";
import { DBT20000Store } from "@/store/POS/DBT/DBT20000Store";

/** Record a loan; the repayment schedule previews live as the terms change. Saving opens the loan (DBT30000). */
defineOptions({ name: "DBT20000" });

const ACCOUNTS = ["CASH", "BANK"];
const { t } = useI18n();
const tr = (k: string) => t(`DBT20000.${k}`);
const router = useRouter();
const store = DBT20000Store();
const money = (v: unknown) => "$ " + UT.currency(Number(v ?? 0), "USD");

onMounted(() => store.reset());

function onSubmit(): void {
	if (!store.lenderName.trim() || !store.termsComplete) {
		POP.alert({ status: "error", title: tr("VALIDATION"), content: tr("REQUIRED_MSG") });
		return;
	}
	store.submit((ok, res, error) => {
		if (ok) {
			POP.alert({ status: "success", title: tr("SAVED"), content: tr("SAVED_MSG") });
			router.replace(res?.loanId ? `/DBT30000?loanId=${encodeURIComponent(res.loanId)}` : "/DBT10000");
		} else {
			const e = error as { message?: string; code?: string } | undefined;
			POP.apiError(e, tr("SAVE_FAILED"));
		}
	});
}
</script>

<style scoped src="../../ACT/act-report.css"></style>
