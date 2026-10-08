<template>
	<div>
		<p class="rlv_hint">{{ t("ATD10000.RECORD_HINT", { n: count }) }}</p>
		<ion-list class="scr_list" lines="full">
			<ion-radio-group v-model="picked">
				<ion-item v-for="o in options" :key="o.leaveTypeId">
					<ion-radio :value="o.leaveTypeId" :disabled="isShort(o)" justify="space-between">
						{{ o.name }}
						<span v-if="!o.isPaid" class="rlv_tag">{{ tr("UNPAID") }}</span>
						<span v-if="o.remainingDays !== undefined" class="rlv_left">{{ t("ATD10000.DAYS_LEFT", { n: o.remainingDays }) }}</span>
					</ion-radio>
				</ion-item>
			</ion-radio-group>
			<ion-item v-if="!options.length" lines="none"><ion-note>{{ tr("NO_LEAVE_TYPES") }}</ion-note></ion-item>
		</ion-list>
		<div class="rlv_btns">
			<ion-button fill="outline" @click="emit('cancel')">{{ tr("CANCEL") }}</ion-button>
			<ion-button :disabled="!picked" @click="onSave">{{ tr("RECORD_LEAVE") }}</ion-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import type { LeaveOption, RecordLeaveChoice } from "@/models/POS/ATD/ATD10000";

/** Pick the leave type a set of Not scanned days is recorded as (ATD10000). Emits ok({ leaveTypeId }). */
defineOptions({ name: "RecordLeaveModal" });

const props = defineProps<{ options: LeaveOption[]; count: number }>();
const emit = defineEmits<{ ok: [RecordLeaveChoice]; cancel: [] }>();
const { t } = useI18n();
const tr = (k: string) => t(`ATD10000.${k}`);
const picked = ref<string | undefined>();

/** Known balance smaller than the days being recorded (server re-checks anyway). */
function isShort(o: LeaveOption): boolean {
	return o.remainingDays !== undefined && o.remainingDays < props.count;
}
function onSave(): void {
	if (picked.value) emit("ok", { leaveTypeId: picked.value });
}
</script>

<style scoped>
.rlv_hint { font-size: 14px; color: var(--ion-color-medium); margin: 8px 0 12px; }
.rlv_tag { font-size: 12px; color: var(--ion-color-warning-shade); margin-left: 4px; }
.rlv_left { font-size: 12px; color: var(--ion-color-medium); margin-left: 8px; }
.rlv_btns { display: flex; gap: 8px; padding: 16px 0; }
.rlv_btns ion-button { flex: 1; }
</style>
