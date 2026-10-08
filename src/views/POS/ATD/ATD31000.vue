<template>
	<ion-page>
		<bm-header :title="editId ? tr('EDIT_TITLE') : tr('PAGE_TITLE')" :default-href="backHref" />
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
					<NumberInput v-model="form.breakMinutes" :label="`${tr('BREAK_MINUTES')} *`" label-placement="stacked" :min="0" :step="5" integer />
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
					<ion-button fill="outline" @click="router.push(backHref)">{{ tr("CANCEL") }}</ion-button>
					<ion-button v-if="editId" :disabled="!canConfirm || saving" @click="saveEdit">{{ tr("SAVE") }}</ion-button>
					<ion-button v-else :disabled="!canConfirm" @click="confirm">{{ tr("NEXT") }}</ion-button>
				</div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import POP from "@/core/utilities/pop";
import NumberInput from "@/core/components/NumberInput.vue";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";
import RetrieveScheduleDetail from "@/services/api/ATD/retrieveScheduleDetail";
import UpdateSchedule from "@/services/api/ATD/updateSchedule";
import type { ATD31000Request, ScheduleDraft, ScheduleRow } from "@/models/POS/ATD/ATD30000";

/** ATD31000 — new work schedule (form → draft → ATD32000), or edit one in place with ?scheduleId. */
defineOptions({ name: "ATD31000" });

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const tr = (k: string) => t(`ATD31000.${k}`);

const blank = () => ({
	name: "",
	nameKhmer: "",
	startTime: undefined as string | undefined,
	endTime: undefined as string | undefined,
	breakType: "NONE",
	breakMinutes: undefined as number | undefined,
	breakStart: undefined as string | undefined,
	breakEnd: undefined as string | undefined
});
const form = reactive(blank());
const workingDays = ref<number[]>([1, 2, 3, 4, 5, 6]);
const saving = ref(false);

const editId = computed(() => String(route.query.scheduleId ?? ""));
const backHref = computed(() => (editId.value ? `/ATD34000?scheduleId=${encodeURIComponent(editId.value)}` : "/ATD30000"));

// Ionic keeps this page alive: every visit starts from the draft (Back from confirm), the schedule
// being edited, or a blank form — never the last schedule created.
useViewEnter(() => {
	Object.assign(form, blank());
	workingDays.value = [1, 2, 3, 4, 5, 6];
	if (editId.value) {
		loadForEdit();
		return;
	}
	const draft = ModuleFlowStore.loadDraft("ATD") as ScheduleDraft | null;
	if (draft) fromRow(draft.payload);
});

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

function payload(): ATD31000Request {
	const days = [...workingDays.value].sort((a, b) => a - b);
	const isFixed = form.breakType === "FIXED";
	const noBreak = form.breakType === "NONE";
	return {
		name: form.name,
		nameKhmer: form.nameKhmer || undefined,
		startTime: form.startTime,
		endTime: form.endTime,
		breakType: form.breakType,
		breakMinutes: noBreak ? 0 : form.breakMinutes,
		breakStart: isFixed ? form.breakStart : undefined,
		breakEnd: isFixed ? form.breakEnd : undefined,
		workingDays: JSON.stringify(days)
	};
}

/** A saved schedule (edit) or a draft payload (back from confirm) — the form's source either way. */
type FormSource = Partial<Omit<ScheduleRow, "breakType">> & { breakType?: string; breakStart?: string; breakEnd?: string };

function fromRow(r: FormSource): void {
	form.name = r.name ?? "";
	form.nameKhmer = r.nameKhmer ?? "";
	form.startTime = r.startTime?.slice(0, 5);
	form.endTime = r.endTime?.slice(0, 5);
	form.breakType = r.breakType ?? "NONE";
	form.breakMinutes = r.breakMinutes;
	form.breakStart = r.breakStart?.slice(0, 5);
	form.breakEnd = r.breakEnd?.slice(0, 5);
	try { workingDays.value = JSON.parse(r.workingDays ?? "[]"); } catch { workingDays.value = []; }
}

function loadForEdit(): void {
	RetrieveScheduleDetail.getInstance().request({
		dataBody: { scheduleId: editId.value },
		listener: {
			onSuccess: (p) => fromRow(p.schedule ?? p),
			onFail: (e) => POP.apiError(e)
		}
	});
}

function saveEdit(): void {
	if (!canConfirm.value || saving.value) return;
	saving.value = true;
	UpdateSchedule.getInstance().request({
		dataBody: { ...payload(), scheduleId: editId.value },
		headers: { "Idempotency-Key": crypto.randomUUID() },
		listener: {
			onSuccess: () => {
				saving.value = false;
				POP.openNotification({ type: "success", content: tr("SAVED") });
				router.replace(backHref.value);
			},
			onFail: (e) => {
				saving.value = false;
				POP.apiError(e, tr("SAVE_FAILED"));
			}
		}
	});
}

function confirm(): void {
	if (!canConfirm.value) return;
	const body = payload();
	const days = JSON.parse(body.workingDays) as number[];
	const isFixed = form.breakType === "FIXED";
	const noBreak = form.breakType === "NONE";
	ModuleFlowStore.saveDraft("ATD", {
		payload: body,
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
