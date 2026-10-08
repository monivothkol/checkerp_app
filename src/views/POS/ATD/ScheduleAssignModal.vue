<template>
	<div>
		<SearchPickField :label="`${tr('ASSIGN_STAFF_FIELD')} *`" :placeholder="tr('ASSIGN_STAFF_PH')" :options="matches" @search="kw = $event" @pick="add" />
		<div class="atd_chips">
			<ion-chip v-for="id in store.staffIds" :key="id" @click="remove(id)">
				<ion-label>{{ nameOf(id) }}</ion-label>
				<ion-icon :icon="closeCircle" />
			</ion-chip>
		</div>
		<ion-list class="scr_list" lines="full">
			<ion-item><ion-input v-model="store.effectiveFrom" type="date" :label="`${tr('ASSIGN_FROM')} *`" label-placement="stacked" /></ion-item>
			<ion-item><ion-input v-model="store.effectiveTo" type="date" :label="tr('ASSIGN_TO')" label-placement="stacked" :helper-text="tr('ASSIGN_TO_PH')" /></ion-item>
		</ion-list>
		<div class="atd_btns">
			<ion-button fill="outline" :disabled="store.saving" @click="emit('cancel')">{{ tr("ASSIGN_CANCEL") }}</ion-button>
			<ion-button :disabled="store.saving || !store.canSave" @click="store.save(scheduleId, tr('ASSIGN_FAILED'))">{{ tr("ASSIGN_SAVE") }}</ion-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { closeCircle } from "ionicons/icons";
import SearchPickField from "@/views/POS/SAL/SearchPickField.vue";
import { ScheduleAssignModalStore } from "@/store/POS/ATD/ScheduleAssignModalStore";

/** Assign one or more staff to a work schedule (ATD35000), opened from ATD34000. Search, tap to add, tap a chip to remove. */
defineOptions({ name: "ScheduleAssignModal" });

defineProps<{ scheduleId: string }>();
const emit = defineEmits<{ ok: []; cancel: [] }>();
const { t } = useI18n();
const tr = (k: string) => t(`ATD34000.${k}`);
const store = ScheduleAssignModalStore();
const kw = ref("");

const matches = computed(() => {
	const q = kw.value.trim().toLowerCase();
	return store.staffOptions
		.filter((s) => !store.staffIds.includes(s.id) && s.name.toLowerCase().includes(q))
		.slice(0, 30)
		.map((s) => ({ value: s.id, label: s.name }));
});
const nameOf = (id: string) => store.staffOptions.find((s) => s.id === id)?.name ?? id;
function add(id: string): void {
	if (!store.staffIds.includes(id)) store.staffIds = [...store.staffIds, id];
}
function remove(id: string): void {
	store.staffIds = store.staffIds.filter((x) => x !== id);
}

watch(() => store.saved, (v) => { if (v) emit("ok"); });
onMounted(() => store.init());
</script>

<style scoped>
.atd_chips { display: flex; flex-wrap: wrap; gap: 4px; padding: 0 8px 8px; }
.atd_btns { display: flex; gap: 8px; padding: 16px 0; }
.atd_btns ion-button { flex: 1; }
</style>
