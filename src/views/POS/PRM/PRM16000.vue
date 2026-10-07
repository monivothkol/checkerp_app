<template>
	<div>
		<ion-list class="scr_list" lines="full">
			<ion-item>
				<ion-select v-model="typeId" :label="`${tr('TYPE')} *`" label-placement="stacked" :placeholder="tr('TYPE_PH')" interface="action-sheet">
					<ion-select-option v-for="o in typeOptions" :key="o.id" :value="o.id">{{ o.name }} — {{ tr("CAT_" + o.category) }}</ion-select-option>
				</ion-select>
			</ion-item>
			<ion-item>
				<ion-input v-model.number="amount" :label="`${tr('AMOUNT')} ($) *`" label-placement="stacked" type="number" inputmode="decimal" min="0" step="1" />
			</ion-item>
			<ion-item>
				<ion-textarea v-model="remark" :label="tr('REMARK')" label-placement="stacked" :placeholder="tr('REMARK_PH')" :rows="2" auto-grow />
			</ion-item>
		</ion-list>
		<div class="prm_btns">
			<ion-button fill="outline" @click="emit('cancel')">{{ tr("CANCEL") }}</ion-button>
			<ion-button :disabled="!typeId || !amount || saving" @click="onSave">{{ tr("SAVE") }}</ion-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import POP from "@/core/utilities/pop";
import AddPayrollLine from "@/services/api/PRM/addPayrollLine";
import RetrieveAdjustmentTypeList from "@/services/api/PRM/retrieveAdjustmentTypeList";
import type { AdjustmentType, AdjustmentTypeOption } from "@/models/POS/PRM/PRM21000";

/** Add a manual bonus/deduction line to a payslip on a DRAFT run (POP.showPopup body). */
defineOptions({ name: "PRM16000" });

const props = defineProps<{ runId: string; staffId: string }>();
const emit = defineEmits<{ ok: []; cancel: [] }>();
const { t } = useI18n();
const tr = (k: string) => t(`PRM16000.${k}`);

const types = ref<AdjustmentType[]>([]);
const typeId = ref<string>();
const amount = ref<number>();
const remark = ref("");
const saving = ref(false);

// Backend may name the id field typeId or id; alias both (same as PRM21000).
const typeOptions = computed<AdjustmentTypeOption[]>(() => types.value.map((x) => ({
	id: x.typeId ?? x.id ?? x.adjustmentTypeId,
	name: x.name ?? x.typeName,
	category: x.category
}) as AdjustmentTypeOption));

onMounted(() => {
	RetrieveAdjustmentTypeList.getInstance().request({
		dataBody: { manualOnly: true },
		listener: { onSuccess: (p: { typeList?: AdjustmentType[] }) => { types.value = p.typeList ?? []; } }
	});
});

function onSave(): void {
	const amt = Number(amount.value);
	if (!typeId.value || Number.isNaN(amt) || amt <= 0) {
		POP.alert({ status: "error", title: tr("VALIDATION"), content: tr("FORM_INVALID") });
		return;
	}
	saving.value = true;
	AddPayrollLine.getInstance().request({
		dataBody: { runId: props.runId, staffId: props.staffId, adjustmentTypeId: typeId.value, amount: amt, remark: remark.value || undefined },
		listener: {
			onSuccess: () => { saving.value = false; emit("ok"); },
			onFail: (e) => { saving.value = false; POP.apiError(e, tr("SAVE_FAILED")); }
		}
	});
}
</script>

<style scoped>
.prm_btns { display: flex; gap: 8px; padding: 16px 0; }
.prm_btns ion-button { flex: 1; }
</style>
