<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu" />
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<ion-list v-else class="scr_list" lines="full">
				<ion-item>
					<ion-toggle v-model="store.form.autoMarkDays" justify="space-between">{{ tr("AUTO_MARK") }}</ion-toggle>
				</ion-item>
				<ion-item lines="none"><ion-note class="atd_hint">{{ tr("AUTO_MARK_HINT") }}</ion-note></ion-item>
				<ion-item>
					<NumberInput v-model="store.form.workingDaysPerMonth" :label="`${tr('WORKING_DAYS')} *`" label-placement="stacked" :min="1" :max="31" integer />
				</ion-item>

				<ion-list-header>{{ tr("DEDUCTION_RULES") }}</ion-list-header>
				<ion-item lines="none"><ion-note class="atd_hint">{{ tr("DAYS_NOTE") }}</ion-note></ion-item>
				<ion-item v-for="f in dayFields" :key="f.key">
					<NumberInput v-model="store.form[f.key]" :label="tr(f.label)" label-placement="stacked" :min="0" :step="0.1" :precision="2" />
				</ion-item>

				<ion-list-header>{{ tr("LATE_RULES") }}</ion-list-header>
				<ion-item lines="none"><ion-note class="atd_hint">{{ tr("LATE_RULES_NOTE") }}</ion-note></ion-item>
				<ion-item v-for="(rule, i) in store.lateRules" :key="i">
					<NumberInput v-model="rule.thresholdCount" :label="tr('LATE_COUNT')" label-placement="stacked" :min="1" integer />
					<NumberInput v-model="rule.deductionDays" :label="tr('LATE_DAYS')" label-placement="stacked" :min="0" :step="0.25" :precision="2" />
					<ion-button slot="end" fill="clear" color="danger" @click="store.removeLateRule(i)">{{ tr("LATE_REMOVE") }}</ion-button>
				</ion-item>
				<ion-item button :detail="false" @click="store.addLateRule()"><ion-label color="primary">+ {{ tr("LATE_ADD") }}</ion-label></ion-item>
			</ion-list>
		</ion-content>
		<ion-footer>
			<ion-toolbar>
				<ion-button expand="block" class="atd_save" :disabled="store.saving || store.loading" @click="onSave">{{ tr("SAVE") }}</ion-button>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useViewEnter } from "@/core/modules/use-view-enter";
import NumberInput from "@/core/components/NumberInput.vue";
import { ATD50000Store } from "@/store/POS/ATD/ATD50000Store";

/** Attendance rules: working days/month, day deductions and late tiers. */
defineOptions({ name: "ATD50000" });

const { t } = useI18n();
const tr = (k: string) => t(`ATD50000.${k}`);
const store = ATD50000Store();
const dayFields = [
	{ key: "absentDeductionDays", label: "ABSENT_DAYS" },
	{ key: "unpaidLeaveDeductionPerDay", label: "UNPAID_LEAVE" },
	{ key: "missingMorningDeductionDays", label: "MISSING_MORNING" },
	{ key: "missingAfternoonDeductionDays", label: "MISSING_AFTERNOON" },
	{ key: "missingFulldayDeductionDays", label: "MISSING_FULLDAY" }
] as const;

useViewEnter(() => store.load());
function onSave(): void {
	store.save({ savedTitle: tr("SAVED"), savedMsg: tr("SAVED_MSG"), failTitle: tr("FAILED") });
}
</script>

<style scoped>
.atd_hint { font-size: 12px; }
.atd_save { margin: 0 8px; }
</style>
