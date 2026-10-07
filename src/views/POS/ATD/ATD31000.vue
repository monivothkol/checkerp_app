<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/ATD30000" />
		<ion-content>
			<ion-list class="scr_list" lines="full">
				<ion-item><ion-input v-model="form.name" :label="`${tr('NAME')} *`" label-placement="stacked" :placeholder="tr('NAME_PH')" /></ion-item>
				<ion-item><ion-input v-model="form.nameKhmer" :label="tr('NAME_KHMER')" label-placement="stacked" /></ion-item>
				<ion-item><ion-input v-model="form.startTime" type="time" :label="`${tr('START_TIME')} *`" label-placement="stacked" /></ion-item>
				<ion-item><ion-input v-model="form.endTime" type="time" :label="`${tr('END_TIME')} *`" label-placement="stacked" /></ion-item>
				<ion-list-header>{{ tr("BREAK_TYPE") }} *</ion-list-header>
				<ion-item lines="none">
					<ion-segment v-model="form.breakType">
						<ion-segment-button value="NONE"><ion-label>{{ tr("BREAK_NONE") }}</ion-label></ion-segment-button>
						<ion-segment-button value="FIXED"><ion-label>{{ tr("BREAK_FIXED") }}</ion-label></ion-segment-button>
						<ion-segment-button value="FLEXIBLE"><ion-label>{{ tr("BREAK_FLEXIBLE") }}</ion-label></ion-segment-button>
					</ion-segment>
				</ion-item>
				<ion-item v-if="form.breakType !== 'NONE'">
					<ion-input v-model.number="form.breakMinutes" :label="`${tr('BREAK_MINUTES')} *`" label-placement="stacked" type="number" inputmode="numeric" min="0" step="5" />
				</ion-item>
				<template v-if="form.breakType === 'FIXED'">
					<ion-item><ion-input v-model="form.breakStart" type="time" :label="`${tr('BREAK_START')} *`" label-placement="stacked" /></ion-item>
					<ion-item><ion-input v-model="form.breakEnd" type="time" :label="`${tr('BREAK_END')} *`" label-placement="stacked" /></ion-item>
				</template>
				<ion-list-header>{{ tr("WORKING_DAYS") }} *</ion-list-header>
				<ion-item v-for="d in 7" :key="d">
					<ion-checkbox :checked="workingDays.includes(d)" justify="space-between" @ion-change="toggleDay(d)">{{ tr("DAY_" + d) }}</ion-checkbox>
				</ion-item>
			</ion-list>
		</ion-content>
		<ion-footer>
			<ion-toolbar>
				<div class="atd_btns">
					<ion-button fill="outline" @click="router.push('/ATD30000')">{{ tr("CANCEL") }}</ion-button>
					<ion-button :disabled="!canConfirm" @click="confirm">{{ tr("NEXT") }}</ion-button>
				</div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";

/** New work schedule, step 1 (form → draft → ATD32000). */
defineOptions({ name: "ATD31000" });

const { t } = useI18n();
const router = useRouter();
const tr = (k: string) => t(`ATD31000.${k}`);

const form = reactive({
	name: "",
	nameKhmer: "",
	startTime: undefined as string | undefined,
	endTime: undefined as string | undefined,
	breakType: "NONE",
	breakMinutes: undefined as number | undefined,
	breakStart: undefined as string | undefined,
	breakEnd: undefined as string | undefined
});
const workingDays = ref<number[]>([1, 2, 3, 4, 5, 6]);

const canConfirm = computed(() => {
	if (!form.name || !form.startTime || !form.endTime) return false;
	if (!workingDays.value.length) return false;
	if (form.breakType !== "NONE" && Number(form.breakMinutes ?? 0) <= 0) return false;
	if (form.breakType === "FIXED" && (!form.breakStart || !form.breakEnd)) return false;
	return true;
});

function toggleDay(d: number): void {
	workingDays.value = workingDays.value.includes(d) ? workingDays.value.filter((x) => x !== d) : [...workingDays.value, d];
}

function confirm(): void {
	if (!canConfirm.value) return;
	const days = [...workingDays.value].sort((a, b) => a - b);
	const isFixed = form.breakType === "FIXED";
	const noBreak = form.breakType === "NONE";
	ModuleFlowStore.saveDraft("ATD", {
		payload: {
			name: form.name,
			nameKhmer: form.nameKhmer || undefined,
			startTime: form.startTime,
			endTime: form.endTime,
			breakType: form.breakType,
			breakMinutes: noBreak ? 0 : form.breakMinutes,
			breakStart: isFixed ? form.breakStart : undefined,
			breakEnd: isFixed ? form.breakEnd : undefined,
			workingDays: JSON.stringify(days)
		},
		idempotencyKey: crypto.randomUUID(),
		display: {
			name: form.name,
			nameKhmer: form.nameKhmer,
			time: `${form.startTime} – ${form.endTime}`,
			breakText: noBreak
				? tr("BREAK_NONE")
				: `${tr("BREAK_" + form.breakType)} · ${Number(form.breakMinutes ?? 0)}${tr("MIN_SUFFIX")}` + (isFixed ? ` (${form.breakStart} – ${form.breakEnd})` : ""),
			days: days.map((d) => tr("DAY_" + d)).join(", ")
		}
	});
	router.push("/ATD32000");
}
</script>

<style scoped>
.atd_btns { display: flex; gap: 8px; padding: 0 8px; }
.atd_btns ion-button { flex: 1; }
</style>
