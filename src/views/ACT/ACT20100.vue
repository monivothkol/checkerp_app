<template>
	<div>
		<ion-progress-bar v-if="store.loading" type="indeterminate" />
		<template v-else-if="store.journal">
			<ion-list class="scr_list" lines="full">
				<ion-item>
					<ion-label><p>{{ tr("DATE") }}</p><h3>{{ store.journal.entryDate }}</h3></ion-label>
					<ion-badge slot="end" :color="store.journal.journalStatusCode === 'POSTED' ? 'success' : 'warning'">{{ store.journal.journalStatusCode }}</ion-badge>
				</ion-item>
				<ion-item>
					<ion-label><p>{{ tr("SOURCE") }}</p><h3>{{ store.journal.sourceType }}<span v-if="store.journal.sourceCode"> · {{ store.journal.sourceCode }}</span></h3></ion-label>
				</ion-item>
				<ion-item v-if="store.journal.reversedByNo">
					<ion-label><p>{{ tr("REVERSED_BY") }}</p><h3>{{ store.journal.reversedByNo }}</h3></ion-label>
				</ion-item>
				<ion-item v-if="store.journal.reversalOfNo">
					<ion-label><p>{{ tr("REVERSAL_OF") }}</p><h3>{{ store.journal.reversalOfNo }}</h3></ion-label>
				</ion-item>
				<ion-item v-if="store.journal.description">
					<ion-label class="ion-text-wrap"><h3>{{ store.journal.description }}</h3></ion-label>
				</ion-item>
			</ion-list>

			<ion-list class="scr_list" lines="full">
				<ion-list-header>{{ tr("ACCOUNT") }}</ion-list-header>
				<ion-item v-for="line in store.journal.lineList" :key="line.lineNo">
					<ion-label class="ion-text-wrap">
						<p>#{{ line.lineNo }} · {{ line.accountCode }}</p>
						<h3>{{ line.accountName }}</h3>
						<p v-if="line.description">{{ line.description }}</p>
					</ion-label>
					<div slot="end" class="jd_amt">
						<template v-if="line.debitAmount > 0"><small>{{ tr("DEBIT") }}</small><b>{{ money(line.debitAmount) }}</b></template>
						<template v-else-if="line.creditAmount > 0"><small>{{ tr("CREDIT") }}</small><b>{{ money(line.creditAmount) }}</b></template>
						<small v-if="foreign(line)">{{ foreign(line) }}</small>
					</div>
				</ion-item>
				<ion-item class="act_total">
					<ion-label><h2>{{ tr("TOTAL") }}</h2></ion-label>
					<div slot="end" class="jd_amt">
						<small>{{ tr("DEBIT") }} <b>{{ money(store.journal.totalDebit) }}</b></small>
						<small>{{ tr("CREDIT") }} <b>{{ money(store.journal.totalCredit) }}</b></small>
					</div>
				</ion-item>
			</ion-list>
		</template>
		<bm-empty-state v-else description="ACT20100.NOT_FOUND" />
	</div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import UT from "@/core/utilities/ut";
import { ACT20100Store } from "@/store/ACT/ACT20100Store";

/** Journal detail sheet body (opened via POP.showPopup from ACT20000/ACT10000): header, lines, totals. */
defineOptions({ name: "ACT20100" });

const props = defineProps<{ journalNo: string }>();
defineEmits<{ ok: []; cancel: [] }>();
const { t } = useI18n();
const tr = (k: string) => t(`ACT20100.${k}`);
const store = ACT20100Store();
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");

/** "4,100,000 KHR" for a line entered in the secondary currency; empty for USD. */
function foreign(line: { originalAmount?: number; originalCurrency?: string }): string {
	if (!line.originalCurrency || line.originalCurrency === "USD" || !line.originalAmount) return "";
	return `${UT.currency(line.originalAmount, line.originalCurrency)} ${line.originalCurrency}`;
}

onMounted(() => store.load(props.journalNo));
</script>

<style scoped src="./act-report.css"></style>
<style scoped>
.jd_amt { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; font-variant-numeric: tabular-nums;
	small { font-size: 10px; color: #6b6b76; }
	b { font-size: 14px; }
}
</style>
