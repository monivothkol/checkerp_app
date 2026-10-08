<template>
	<div>
		<p class="prm_label">{{ label }}</p>
		<p v-if="balance != null" class="prm_balance">{{ tr("BALANCE") }} $ {{ balance.toFixed(2) }}</p>
		<ion-list class="scr_list" lines="full">
			<ion-item>
				<NumberInput v-model="amount" :label="`${tr('AMOUNT')} *`" label-placement="stacked" min="0" :max="balance" step="1" />
			</ion-item>
		</ion-list>
		<div class="prm_btns">
			<ion-button fill="outline" @click="emit('cancel')">{{ tr("CANCEL") }}</ion-button>
			<ion-button :disabled="saving" @click="onSave">{{ tr("SAVE") }}</ion-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import NumberInput from "@/core/components/NumberInput.vue";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import POP from "@/core/utilities/pop";
import UpdatePayrollLineAmount from "@/services/api/PRM/updatePayrollLineAmount";

/** Edit a recovery line's amount, capped by the loan/advance balance (POP.showPopup body). */
defineOptions({ name: "PRM19000" });

const props = withDefaults(defineProps<{ lineId: string; label?: string; current?: number; balance?: number }>(), { label: "", current: 0, balance: undefined });
const emit = defineEmits<{ ok: []; cancel: [] }>();
const { t } = useI18n();
const tr = (k: string) => t(`PRM19000.${k}`);
const amount = ref<number | undefined>(props.current);
const saving = ref(false);

function onSave(): void {
	const amt = Number(amount.value);
	if (Number.isNaN(amt) || amt < 0 || (props.balance != null && amt > props.balance)) {
		POP.alert({ status: "error", title: tr("VALIDATION"), content: tr("AMOUNT_INVALID") });
		return;
	}
	saving.value = true;
	UpdatePayrollLineAmount.getInstance().request({
		dataBody: { lineId: props.lineId, amount: amt },
		listener: {
			onSuccess: () => { saving.value = false; emit("ok"); },
			onFail: (e) => { saving.value = false; POP.apiError(e, tr("SAVE_FAILED")); }
		}
	});
}
</script>

<style scoped>
.prm_label { font-size: 14px; font-weight: 600; margin: 0 0 4px; }
.prm_balance { font-size: 12px; color: var(--ion-color-medium); margin: 0 0 8px; }
.prm_btns { display: flex; gap: 8px; padding: 16px 0; }
.prm_btns ion-button { flex: 1; }
</style>
