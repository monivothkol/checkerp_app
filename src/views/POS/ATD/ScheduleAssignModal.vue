<template>
	<div>
		<ion-list class="scr_list" lines="full">
			<ion-item>
				<ion-select v-model="store.staffId" :label="`${tr('ASSIGN_STAFF_FIELD')} *`" label-placement="stacked" :placeholder="tr('ASSIGN_STAFF_PH')" interface="alert" :interface-options="{ header: tr('ASSIGN_STAFF_FIELD') }">
					<ion-select-option v-for="s in store.staffOptions" :key="s.id" :value="s.id">{{ s.name }}</ion-select-option>
				</ion-select>
			</ion-item>
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
import { onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { ScheduleAssignModalStore } from "@/store/POS/ATD/ScheduleAssignModalStore";

/** Assign a staff member to a work schedule (ATD35000), opened from ATD34000. */
defineOptions({ name: "ScheduleAssignModal" });

defineProps<{ scheduleId: string }>();
const emit = defineEmits<{ ok: []; cancel: [] }>();
const { t } = useI18n();
const tr = (k: string) => t(`ATD34000.${k}`);
const store = ScheduleAssignModalStore();

watch(() => store.saved, (v) => { if (v) emit("ok"); });
onMounted(() => store.init());
</script>

<style scoped>
.atd_btns { display: flex; gap: 8px; padding: 16px 0; }
.atd_btns ion-button { flex: 1; }
</style>
