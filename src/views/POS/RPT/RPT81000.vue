<template>
	<div>
		<ion-list class="scr_list" lines="full">
			<ion-item><ion-input v-model="form.startDate" type="date" :label="`${tr('START')} *`" label-placement="stacked" /></ion-item>
			<ion-item><ion-input v-model="form.endDate" type="date" :label="`${tr('END')} *`" label-placement="stacked" /></ion-item>
			<ion-item>
				<ion-select v-model="form.criteriaType" :label="`${tr('CRITERIA')} *`" label-placement="stacked" interface="action-sheet">
					<ion-select-option v-for="o in opts(['INVOICE_SELL', 'BRANCH_MONTHLY_REVENUE', 'BRANCH_YEARLY_REVENUE'])" :key="o.value" :value="o.value">{{ o.label }}</ion-select-option>
				</ion-select>
			</ion-item>
			<ion-item>
				<ion-select v-model="form.inputType" :label="`${tr('INPUT_TYPE')} *`" label-placement="stacked" interface="action-sheet">
					<ion-select-option v-for="o in opts(['PERCENTAGE', 'AMOUNT'])" :key="o.value" :value="o.value">{{ o.label }}</ion-select-option>
				</ion-select>
			</ion-item>
			<ion-item>
				<ion-input v-model.number="form.inputValue" :label="`${form.inputType === 'PERCENTAGE' ? tr('PERCENT') : tr('AMOUNT_LABEL')} *`" label-placement="stacked"
					type="number" inputmode="decimal" min="0" step="1" />
			</ion-item>
			<ion-item>
				<ion-select v-model="form.applyToType" :label="`${tr('APPLY_TO')} *`" label-placement="stacked" interface="action-sheet">
					<ion-select-option v-for="o in opts(['SPECIFIC_STAFF', 'SALE_PERSON'])" :key="o.value" :value="o.value">{{ o.label }}</ion-select-option>
				</ion-select>
			</ion-item>
			<ion-item>
				<ion-select v-model="form.distributionType" :label="`${tr('DISTRIBUTION')} *`" label-placement="stacked" interface="action-sheet">
					<ion-select-option v-for="o in opts(['EQUAL_SPLIT', 'FULL_EACH'])" :key="o.value" :value="o.value">{{ o.label }}</ion-select-option>
				</ion-select>
			</ion-item>
			<ion-item>
				<ion-select v-model="form.applyToFilters" :label="`${tr('STAFF')} *`" label-placement="stacked" :placeholder="tr('STAFF_PH')" :multiple="true" interface="alert">
					<ion-select-option v-for="s in staff" :key="s.staffId" :value="s.staffId">{{ staffLabel(s) }}</ion-select-option>
				</ion-select>
			</ion-item>
			<ion-item>
				<ion-select v-model="form.inventoryId" :label="tr('INVENTORY')" label-placement="stacked" :placeholder="tr('INVENTORY_PH')" interface="action-sheet">
					<ion-select-option :value="undefined">{{ tr("INVENTORY_PH") }}</ion-select-option>
					<ion-select-option v-for="i in inventories" :key="i.inventoryId" :value="i.inventoryId">{{ i.inventoryName ?? i.name }}</ion-select-option>
				</ion-select>
			</ion-item>
		</ion-list>

		<ion-button fill="outline" size="small" :disabled="calculating" @click="onCalculate">{{ tr("CALCULATE") }}</ion-button>

		<template v-if="result">
			<div class="r81_summary">
				<span>{{ tr("CRITERIA_VALUE") }}: <b>{{ money(result.criteriaValue) }}</b></span>
				<span>{{ tr("TOTAL") }}: <b class="r81_total">{{ money(result.totalCommissionAmount) }}</b></span>
			</div>
			<ion-list class="scr_list" lines="full">
				<ion-item v-for="(r, i) in result.recipients" :key="r.recipientId ?? i">
					<ion-label>
						<h3>{{ r.recipientName }}</h3>
						<p>{{ r.department ?? "—" }} · {{ tr("COL_SHARE") }} {{ r.sharePercentage }}%</p>
					</ion-label>
					<b slot="end">{{ money(r.commissionAmount) }}</b>
				</ion-item>
			</ion-list>
		</template>

		<div class="r81_btns">
			<ion-button fill="outline" @click="emit('cancel')">{{ tr("CANCEL") }}</ion-button>
			<ion-button :disabled="!result || saving" @click="onSave">{{ tr("SAVE") }}</ion-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import POP from "@/core/utilities/pop";
import UT from "@/core/utilities/ut";
import RetrieveStaffList from "@/services/api/STM/retrieveStaffList";
import RetrieveInventoryList from "@/services/api/INV/retrieveInventoryList";
import CalculateCommission from "@/services/api/RPT/CalculateCommission";
import SaveCommission from "@/services/api/RPT/SaveCommission";
import type { CommissionCalcRequest, CommissionCalcResult } from "@/models/POS/RPT/RPT80000";
import type { InventoryLookup, StaffLookup } from "@/models/POS/COMMON/lookups";

/** Commission calculator (POP.showPopup body): Calculate previews, Save persists and emits ok. */
defineOptions({ name: "RPT81000" });

const emit = defineEmits<{ ok: [string]; cancel: [] }>();
const { t, te } = useI18n();
const tr = (key: string) => t(`RPT81000.${key}`);
const money = (v: unknown) => "$ " + UT.currency(Number(v ?? 0), "USD");

const calculating = ref(false);
const saving = ref(false);
const staff = ref<StaffLookup[]>([]);
const inventories = ref<InventoryLookup[]>([]);
const result = ref<CommissionCalcResult | null>(null);
const form = reactive({
	startDate: undefined as string | undefined,
	endDate: undefined as string | undefined,
	criteriaType: "INVOICE_SELL",
	inputType: "PERCENTAGE",
	inputValue: undefined as number | undefined,
	applyToType: "SPECIFIC_STAFF",
	applyToFilters: [] as string[],
	distributionType: "EQUAL_SPLIT",
	inventoryId: undefined as string | undefined
});

onMounted(() => {
	RetrieveStaffList.getInstance().request({ dataBody: { pageNo: 1, pageSize: 300 }, listener: { onSuccess: (p) => { staff.value = p.staffList ?? []; } } });
	RetrieveInventoryList.getInstance().request({ dataBody: { pageNo: 1, pageSize: 300 }, listener: { onSuccess: (p) => { inventories.value = p.inventoryList ?? []; } } });
});

const opts = (values: string[]) => values.map((v) => ({ value: v, label: te(`RPT81000.O_${v}`) ? t(`RPT81000.O_${v}`) : v }));
const staffLabel = (s: StaffLookup) => s.staffName ?? `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim();

function payload(): CommissionCalcRequest {
	return {
		startDate: form.startDate as string,
		endDate: form.endDate as string,
		criteriaType: form.criteriaType,
		inputType: form.inputType,
		inputValue: Number(form.inputValue),
		applyToType: form.applyToType,
		applyToFilters: form.applyToFilters,
		distributionType: form.distributionType,
		inventoryId: form.inventoryId || undefined
	};
}
function invalid(): boolean {
	const fail = (key: string) => { POP.alert({ status: "error", title: tr("VALIDATION"), content: tr(key) }); return true; };
	if (!form.startDate || !form.endDate) return fail("DATE_REQUIRED");
	if (!form.inputValue || Number(form.inputValue) <= 0) return fail("VALUE_REQUIRED");
	if (!form.applyToFilters.length) return fail("STAFF_REQUIRED");
	return false;
}

function onCalculate(): void {
	if (invalid()) return;
	calculating.value = true;
	CalculateCommission.getInstance().request({
		dataBody: payload(),
		listener: {
			onSuccess: (res) => { calculating.value = false; result.value = res; },
			onFail: (e) => { calculating.value = false; result.value = null; POP.apiError(e, tr("CALC_FAILED")); }
		}
	});
}
function onSave(): void {
	if (!result.value || invalid()) return;
	saving.value = true;
	SaveCommission.getInstance().request({
		dataBody: payload(),
		listener: {
			onSuccess: (res) => {
				saving.value = false;
				POP.alert({ status: "success", title: tr("SAVED"), content: t("RPT81000.SAVED_MSG", { code: res.commissionCode }) });
				emit("ok", res.commissionId);
			},
			onFail: (e) => { saving.value = false; POP.apiError(e, tr("SAVE_FAILED")); }
		}
	});
}
</script>

<style scoped>
.r81_summary { display: flex; justify-content: space-between; gap: 8px; font-size: 14px; padding: 12px 0 8px; }
.r81_total { color: var(--ion-color-primary); }
.r81_btns { display: flex; gap: 8px; padding: 16px 0; }
.r81_btns ion-button { flex: 1; }
</style>
