<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/ATD30000" />
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<template v-else-if="store.schedule">
				<ion-list class="scr_list" lines="full">
					<ion-item><ion-label><p>{{ tr("COL_CODE") }}</p><h3>{{ store.schedule.scheduleCode }}</h3></ion-label></ion-item>
					<ion-item>
						<ion-label>
							<p>{{ tr("NAME") }}</p>
							<h3>{{ store.schedule.name }} <span v-if="store.schedule.nameKhmer" class="atd_khmer">{{ store.schedule.nameKhmer }}</span></h3>
						</ion-label>
						<ion-badge v-if="store.schedule.isDefault" slot="end" color="tertiary">{{ tr("DEFAULT") }}</ion-badge>
					</ion-item>
					<ion-item><ion-label><p>{{ tr("TIME") }}</p><h3>{{ hhmm(store.schedule.startTime) }} – {{ hhmm(store.schedule.endTime) }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("BREAK") }}</p><h3>{{ breakText(store.schedule) }}</h3></ion-label></ion-item>
					<ion-item><ion-label class="ion-text-wrap"><p>{{ tr("DAYS") }}</p><h3>{{ daysText(store.schedule.workingDays) }}</h3></ion-label></ion-item>
					<ion-item>
						<ion-label><p>{{ tr("STATUS") }}</p></ion-label>
						<ion-badge slot="end" :color="store.schedule.isActive ? 'success' : 'medium'">{{ store.schedule.isActive ? tr("ACTIVE") : tr("INACTIVE") }}</ion-badge>
					</ion-item>
				</ion-list>

				<ion-list class="scr_list" lines="full">
					<ion-list-header>
						<ion-label>{{ tr("ASSIGNMENTS") }}</ion-label>
						<ion-button @click="openAssign">+ {{ tr("ASSIGN") }}</ion-button>
					</ion-list-header>
					<ion-item v-for="a in store.assignments" :key="a.assignmentId">
						<ion-label>
							<p class="atd_code">{{ a.staffCode }}</p>
							<h3>{{ a.staffName }}</h3>
							<p>{{ tr("COL_FROM") }}: {{ String(a.effectiveFrom ?? "").slice(0, 10) }} · {{ tr("COL_TO") }}: {{ a.effectiveTo ? String(a.effectiveTo).slice(0, 10) : tr("OPEN_ENDED") }}</p>
						</ion-label>
					</ion-item>
					<ion-item v-if="!store.assignments.length"><ion-note>—</ion-note></ion-item>
				</ion-list>
			</template>
			<bm-empty-state v-else description="ATD34000.NOT_FOUND" />
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import POP from "@/core/utilities/pop";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { ATD34000Store } from "@/store/POS/ATD/ATD34000Store";
import ScheduleAssignModal from "@/views/POS/ATD/ScheduleAssignModal.vue";
import type { ScheduleRow } from "@/models/POS/ATD/ATD30000";

/** Work schedule detail + staff assignments (assign via ScheduleAssignModal). */
defineOptions({ name: "ATD34000" });

const { t } = useI18n();
const route = useRoute();
const tr = (k: string) => t(`ATD34000.${k}`);
const store = ATD34000Store();
const scheduleId = computed(() => String(route.query.scheduleId ?? ""));
useViewEnter(() => store.load(scheduleId.value));

const hhmm = (v: unknown) => (String(v ?? "") ? String(v).slice(0, 5) : "—");
function breakText(r: ScheduleRow): string {
	if (!r.breakType || r.breakType === "NONE") return tr("BREAK_NONE");
	return `${tr("BREAK_" + r.breakType)} · ${Number(r.breakMinutes ?? 0)}${tr("MIN_SUFFIX")}`;
}
function daysText(v: unknown): string {
	let days: number[] = [];
	try { days = JSON.parse(String(v ?? "[]")); } catch { days = []; }
	if (!Array.isArray(days) || !days.length) return "—";
	return days.map((d) => tr("DAY_" + d)).join(", ");
}
function openAssign(): void {
	POP.showPopup(ScheduleAssignModal, { title: tr("ASSIGN_TITLE"), props: { scheduleId: scheduleId.value } }).promise
		.then(() => store.load(scheduleId.value))
		.catch(() => undefined);
}
</script>

<style scoped>
.atd_code { font-size: 12px; }
.atd_khmer { font-size: 12px; color: var(--ion-color-medium); }
ion-label h3 { font-size: 14px; }
ion-label p { font-size: 12px; }
</style>
