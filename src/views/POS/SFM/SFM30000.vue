<template>
	<div>
		<ion-list class="scr_list" lines="full">
			<ion-item>
				<ion-select v-model="store.accountType" :label="`${tr('ACCOUNT_TYPE')} *`" label-placement="stacked" :placeholder="tr('ACCOUNT_TYPE_PH')" interface="action-sheet" @ion-change="onAccountTypeChange">
					<ion-select-option v-for="a in accounts" :key="a" :value="a">{{ tr(a) }}</ion-select-option>
				</ion-select>
			</ion-item>
			<ion-item>
				<ion-select v-model="store.transactionType" :label="`${tr('TYPE')} *`" label-placement="stacked" :placeholder="tr('TYPE_PH')" :disabled="!store.accountType" interface="action-sheet">
					<ion-select-option v-for="x in typeOptions" :key="x" :value="x">{{ tr(x) }}</ion-select-option>
				</ion-select>
			</ion-item>
			<ion-item>
				<NumberInput v-model="store.amount" :label="`${tr('AMOUNT')} *`" label-placement="stacked" min="0.01" step="1" :placeholder="tr('AMOUNT_PH')" />
			</ion-item>
			<ion-item>
				<ion-input v-model="store.referenceNo" :label="tr('REFERENCE')" label-placement="stacked" :placeholder="tr('REFERENCE_PH')" :clear-input="true" />
			</ion-item>
			<ion-item>
				<ion-input :value="String(store.trnDate ?? '').slice(0, 10)" type="date" :label="tr('DATE')" label-placement="stacked" :helper-text="tr('DATE_PH')" @ion-change="onDate(String($event.detail.value ?? ''))" />
			</ion-item>
			<ion-item>
				<ion-textarea v-model="store.remark" :label="tr('REMARK')" label-placement="stacked" :placeholder="tr('REMARK_PH')" :rows="2" auto-grow />
			</ion-item>
		</ion-list>
		<div class="sfm_btns">
			<ion-button fill="outline" @click="emit('cancel')">{{ tr("CANCEL") }}</ion-button>
			<ion-button :disabled="store.submitting" @click="onSubmit">{{ tr("SUBMIT") }}</ion-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import NumberInput from "@/core/components/NumberInput.vue";
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import POP from "@/core/utilities/pop";
import { SFM30000Store } from "@/store/POS/SFM/SFM30000Store";

/** Post a staff financial transaction (POP.showPopup body); emits `ok` after a successful post. */
defineOptions({ name: "SFM30000" });

const props = defineProps<{ staffId: string }>();
const emit = defineEmits<{ ok: []; cancel: [] }>();
const { t } = useI18n();
const tr = (k: string) => t(`SFM30000.${k}`);
const store = SFM30000Store();

const accounts = ["LOAN", "ADVANCE", "DEPOSIT"];
// Operational (non-adjustment) transaction types for the selected account.
const byAccount: Record<string, string[]> = {
	LOAN: ["LOAN_DISBURSEMENT", "LOAN_REPAYMENT"],
	ADVANCE: ["ADVANCE_ISSUED", "ADVANCE_REPAYMENT"],
	DEPOSIT: ["SECURITY_DEPOSIT", "DEPOSIT_REFUND"]
};
const typeOptions = computed(() => (store.accountType ? byAccount[store.accountType] ?? [] : []));

onMounted(() => store.reset(props.staffId));

// Switching account resets the transaction type to that account's first option (v1 parity).
function onAccountTypeChange(): void {
	store.transactionType = typeOptions.value[0];
}
// Same wire format as the web picker (YYYY-MM-DDTHH:mm:ss); cleared = server date.
function onDate(v: string): void {
	store.trnDate = v ? `${v}T00:00:00` : undefined;
}
function onSubmit(): void {
	if (!store.transactionType) {
		POP.alert({ status: "error", title: tr("VALIDATION"), content: tr("TYPE_REQUIRED") });
		return;
	}
	const amt = Number(store.amount);
	if (!amt || amt <= 0) {
		POP.alert({ status: "error", title: tr("VALIDATION"), content: tr("AMOUNT_REQUIRED") });
		return;
	}
	store.submit((ok, _res, error) => {
		if (ok) {
			POP.alert({ status: "success", title: tr("SAVED"), content: tr("SAVED_MSG") });
			emit("ok");
		} else {
			POP.apiError(error as { code?: string; message?: string } | undefined, tr("SAVE_FAILED"));
		}
	});
}
</script>

<style scoped>
.sfm_btns { display: flex; gap: 8px; padding: 16px 0; }
.sfm_btns ion-button { flex: 1; }
</style>
