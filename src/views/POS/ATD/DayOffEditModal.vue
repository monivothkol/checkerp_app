<template>
	<div>
		<ion-searchbar v-model="keyword" :placeholder="tr('SEARCH_STAFF')" :debounce="0" />
		<ion-list class="scr_list" lines="full">
			<ion-item v-for="s in shown" :key="s.staffId">
				<ion-checkbox :checked="picked.includes(s.staffId)" justify="space-between" @ion-change="toggle(s.staffId)">
					{{ s.staffName }} <span class="dof_code">{{ s.staffCode }}</span>
				</ion-checkbox>
			</ion-item>
			<ion-item v-if="!shown.length" lines="none"><ion-note>{{ tr("NO_STAFF") }}</ion-note></ion-item>
		</ion-list>
		<ion-list class="scr_list" lines="none">
			<ion-item>
				<NumberInput v-model="repeatWeeks" :label="`${tr('REPEAT')} … ${tr('REPEAT_WEEKS')}`" label-placement="stacked" :min="0" :max="12" integer />
			</ion-item>
		</ion-list>
		<div class="dof_btns">
			<ion-button fill="outline" @click="emit('cancel')">{{ tr("CANCEL") }}</ion-button>
			<ion-button @click="onSave">{{ tr("SAVE") }}</ion-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import NumberInput from "@/core/components/NumberInput.vue";
import type { DayOffEdit, DayOffStaff } from "@/models/POS/ATD/ATD60000";

/** Pick who is off on one date (ATD60000). Emits ok({ staffIds, repeatWeeks }); none picked = nobody off. */
defineOptions({ name: "DayOffEditModal" });

const props = withDefaults(defineProps<{ staff: DayOffStaff[]; selected?: string[] }>(), { selected: () => [] });
const emit = defineEmits<{ ok: [DayOffEdit]; cancel: [] }>();
const { t } = useI18n();
const tr = (k: string) => t(`ATD60000.${k}`);
const picked = ref<string[]>([...props.selected]);
const keyword = ref("");
const repeatWeeks = ref<number | null>(0);

const shown = computed(() => {
	const q = keyword.value.trim().toLowerCase();
	return q ? props.staff.filter((s) => `${s.staffName ?? ""} ${s.staffCode ?? ""}`.toLowerCase().includes(q)) : props.staff;
});
function toggle(id: string): void {
	picked.value = picked.value.includes(id) ? picked.value.filter((x) => x !== id) : [...picked.value, id];
}
function onSave(): void {
	emit("ok", { staffIds: picked.value, repeatWeeks: Number(repeatWeeks.value ?? 0) });
}
</script>

<style scoped>
.dof_code { font-size: 12px; color: var(--ion-color-medium); margin-left: 4px; }
.dof_btns { display: flex; gap: 8px; padding: 16px 0; }
.dof_btns ion-button { flex: 1; }
</style>
