<template>
	<div>
		<p class="dept_hint">{{ tr("DEPT_DEFAULT_HINT") }}</p>
		<SearchPickField :label="`${tr('DEPARTMENT')} *`" :placeholder="tr('DEPARTMENT_PH')" :options="matches" :searching="loading" @search="kw = $event" @pick="departmentId = $event" />
		<ion-list v-if="chosen" class="scr_list" lines="none">
			<ion-item><ion-label>{{ chosen.departmentName }}</ion-label><ion-icon slot="end" :icon="checkmarkCircle" color="success" /></ion-item>
		</ion-list>
		<div class="dept_btns">
			<ion-button fill="outline" :disabled="saving" @click="emit('cancel')">{{ tr("ASSIGN_CANCEL") }}</ion-button>
			<ion-button :disabled="saving || !departmentId" @click="onSave">{{ tr("ASSIGN_SAVE") }}</ion-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { checkmarkCircle } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import SearchPickField from "@/views/POS/SAL/SearchPickField.vue";
import RetrieveDepartmentList from "@/services/api/DPM/retrieveDepartmentList";
import SetScheduleDepartmentDefault from "@/services/api/ATD/setScheduleDepartmentDefault";
import type { DepartmentRow } from "@/models/POS/DPM/DPM10000";

/** Make a work schedule the default of a department (its staff without an own schedule follow it). */
defineOptions({ name: "ScheduleDepartmentModal" });

const props = defineProps<{ scheduleId: string }>();
const emit = defineEmits<{ ok: []; cancel: [] }>();
const { t } = useI18n();
const tr = (k: string) => t(`ATD34000.${k}`);
const departments = ref<DepartmentRow[]>([]);
const departmentId = ref<string>();
const loading = ref(true);
const saving = ref(false);
const kw = ref("");

const matches = computed(() => {
	const q = kw.value.trim().toLowerCase();
	return departments.value
		.filter((d) => (d.departmentName ?? "").toLowerCase().includes(q))
		.slice(0, 30)
		.map((d) => ({ value: d.departmentId, label: d.departmentName ?? d.departmentId }));
});
const chosen = computed(() => departments.value.find((d) => d.departmentId === departmentId.value));

onMounted(() => {
	RetrieveDepartmentList.getInstance().request({
		dataBody: { pageNo: 1, pageSize: 200 },
		listener: {
			onSuccess: (p) => { departments.value = p.departmentList ?? []; loading.value = false; },
			onFail: () => { loading.value = false; }
		}
	});
});

function onSave(): void {
	if (!departmentId.value || saving.value) return;
	saving.value = true;
	SetScheduleDepartmentDefault.getInstance().request({
		dataBody: { scheduleId: props.scheduleId, departmentId: departmentId.value },
		headers: { "Idempotency-Key": crypto.randomUUID() },
		listener: {
			onSuccess: () => { saving.value = false; emit("ok"); },
			onFail: (e) => { saving.value = false; POP.apiError(e, tr("ASSIGN_FAILED")); }
		}
	});
}
</script>

<style scoped>
.dept_hint { font-size: 12px; color: var(--ion-color-medium); padding: 0 16px; margin: 0 0 8px; }
.dept_btns { display: flex; gap: 8px; padding: 16px 0; }
.dept_btns ion-button { flex: 1; }
</style>
