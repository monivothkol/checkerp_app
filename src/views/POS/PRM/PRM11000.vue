<template>
	<div>
		<ion-list class="scr_list" lines="full">
			<ion-item>
				<ion-input v-model="periodMonth" type="month" :label="`${tr('PERIOD')} *`" label-placement="stacked" :placeholder="tr('PERIOD_PH')" />
			</ion-item>
			<ion-item>
				<!-- Explicit whole-company choice: empty already means every department. -->
				<ion-select v-model="departmentId" :label="tr('DEPARTMENT')" label-placement="stacked" :placeholder="tr('ALL_DEPARTMENTS')" interface="action-sheet">
					<ion-select-option :value="undefined">{{ tr("ALL_DEPARTMENTS") }}</ion-select-option>
					<ion-select-option v-for="d in departments" :key="d.departmentId" :value="d.departmentId">{{ d.departmentName }}</ion-select-option>
				</ion-select>
			</ion-item>
		</ion-list>
		<p v-if="departmentsFailed" class="prm_hint prm_warn">{{ tr("DEPARTMENTS_FAILED") }}</p>
		<p class="prm_hint">{{ tr("HINT") }}</p>
		<div class="prm_btns">
			<ion-button fill="outline" @click="emit('cancel')">{{ tr("CANCEL") }}</ion-button>
			<ion-button :disabled="saving" @click="onCreate">{{ tr("CREATE") }}</ion-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import POP from "@/core/utilities/pop";
import CreatePayrollRun from "@/services/api/PRM/createPayrollRun";
import ModuleApi from "@/services/api/COMMON/module-api";

interface DepartmentOption { departmentId: string; departmentName?: string }

/** New payroll run (POP.showPopup body). Emits `ok` with the new runId. */
defineOptions({ name: "PRM11000" });

const emit = defineEmits<{ ok: [string]; cancel: [] }>();
const { t } = useI18n();
const tr = (k: string) => t(`PRM11000.${k}`);

const periodMonth = ref<string>();
const departmentId = ref<string>();
const departments = ref<DepartmentOption[]>([]);
const departmentsFailed = ref(false);
const saving = ref(false);

onMounted(() => {
	ModuleApi.request<{ departmentList?: DepartmentOption[] }>("DPM10000I01", { pageNo: 1, pageSize: 200 }, {
		onSuccess: (p) => { departments.value = p.departmentList ?? []; },
		// Say the load failed rather than showing an empty picker.
		onFail: () => { departmentsFailed.value = true; }
	});
});

function onCreate(): void {
	if (!periodMonth.value) {
		POP.alert({ status: "error", title: tr("VALIDATION"), content: tr("PERIOD_REQUIRED") });
		return;
	}
	saving.value = true;
	CreatePayrollRun.getInstance().request({
		dataBody: { periodMonth: periodMonth.value, departmentId: departmentId.value },
		listener: {
			onSuccess: (res) => { saving.value = false; emit("ok", res.runId); },
			onFail: (e) => { saving.value = false; POP.apiError(e, tr("CREATE_FAILED")); }
		}
	});
}
</script>

<style scoped>
.prm_hint { color: var(--ion-color-medium); font-size: 12px; margin: 8px 0 0; }
.prm_warn { color: var(--ion-color-danger); }
.prm_btns { display: flex; gap: 8px; padding: 16px 0; }
.prm_btns ion-button { flex: 1; }
</style>
