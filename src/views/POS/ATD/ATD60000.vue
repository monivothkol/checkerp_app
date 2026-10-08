<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #bottom>
				<PickField v-model="departmentId" :options="departmentOptions" :label="tr('DEPARTMENT')" :placeholder="tr('ALL_DEPARTMENTS')" :none-label="tr('ALL_DEPARTMENTS')" @change="(v) => store.setDepartment(v as string | undefined)" />
			</template>
		</bm-header>
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<div class="dof_nav">
				<ion-button fill="clear" @click="shiftMonth(-1)"><ion-icon slot="icon-only" :icon="chevronBack" /></ion-button>
				<span class="dof_month">{{ monthLabel }}</span>
				<ion-button fill="clear" @click="shiftMonth(1)"><ion-icon slot="icon-only" :icon="chevronForward" /></ion-button>
			</div>
			<p class="dof_hint">{{ tr("HINT") }}</p>
			<div class="dof_grid">
				<div v-for="d in 7" :key="'h' + d" class="dof_wd">{{ weekdayName(d) }}</div>
				<button v-for="c in cells" :key="c.date" type="button" class="dof_day" :class="{ out: !c.inMonth, today: c.date === today }" @click="openDay(c.date)">
					<span class="dof_num">{{ c.day }}</span>
					<span v-if="(store.byDate[c.date] ?? []).length" class="dof_count">{{ (store.byDate[c.date] ?? []).length }}</span>
					<span v-for="m in (store.byDate[c.date] ?? []).slice(0, 2)" :key="m.staffId" class="dof_name">{{ m.staffName }}</span>
				</button>
			</div>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { chevronBack, chevronForward } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import PickField from "@/core/components/PickField.vue";
import { useViewEnter } from "@/core/modules/use-view-enter";
import DayOffEditModal from "@/views/POS/ATD/DayOffEditModal.vue";
import { ATD60000Store } from "@/store/POS/ATD/ATD60000Store";
import type { DayOffEdit } from "@/models/POS/ATD/ATD60000";

/** ATD60000 — day-off calendar: tap a date, tick who is off. An unmarked day is a working day. */
defineOptions({ name: "ATD60000" });

const { t } = useI18n();
const tr = (k: string) => t(`ATD60000.${k}`);
const store = ATD60000Store();
const departmentId = ref<string | undefined>(store.departmentId);
const today = dayjs().format("YYYY-MM-DD");

useViewEnter(() => {
	if (!store.departments.length) store.loadDepartments();
	store.load();
});

const departmentOptions = computed(() => store.departments.map((d) => ({ value: d.departmentId, label: d.departmentName ?? d.departmentId })));
const monthLabel = computed(() => dayjs(store.month + "-01").format("MMMM YYYY"));
/** Monday-first weeks covering the month. */
const cells = computed(() => {
	const first = dayjs(store.month + "-01");
	const start = first.subtract((first.day() + 6) % 7, "day");
	const last = first.endOf("month");
	const end = last.add((7 - last.day()) % 7, "day");
	const out: { date: string; day: number; inMonth: boolean }[] = [];
	for (let d = start; !d.isAfter(end, "day"); d = d.add(1, "day")) {
		out.push({ date: d.format("YYYY-MM-DD"), day: d.date(), inMonth: d.month() === first.month() });
	}
	return out;
});
const weekdayName = (i: number) => dayjs("2026-10-05").add(i - 1, "day").format("dd"); // 5 Oct 2026 is a Monday

function shiftMonth(step: number): void {
	store.setMonth(dayjs(store.month + "-01").add(step, "month").format("YYYY-MM"));
}
function openDay(date: string): void {
	const selected = (store.byDate[date] ?? []).map((m) => m.staffId);
	POP.showPopup<DayOffEdit>(DayOffEditModal, {
		title: `${tr("EDIT_TITLE")} · ${dayjs(date).format("ddd DD MMM YYYY")}`,
		props: { staff: store.staff, selected }
	}).promise
		.then((r) => { if (r.data) store.save(date, r.data.staffIds, r.data.repeatWeeks, tr("SAVE_FAILED")); })
		.catch(() => undefined);
}
</script>

<style scoped>
.dof_nav { display: flex; align-items: center; justify-content: space-between; padding: 0 8px; }
.dof_month { font-size: 16px; font-weight: 600; }
.dof_hint { font-size: 12px; color: var(--ion-color-medium); padding: 8px 16px 0; margin: 0; }
.dof_grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; padding: 8px; }
.dof_wd { text-align: center; font-size: 10px; color: var(--ion-color-medium); padding: 4px 0; }
.dof_day { min-height: 64px; display: flex; flex-direction: column; align-items: stretch; gap: 2px; padding: 4px 2px; border: 1px solid #E5E5EA; border-radius: 4px; background: #fff; text-align: left; overflow: hidden; }
.dof_day.out { opacity: .45; }
.dof_day.today { border-color: var(--ion-color-primary); }
.dof_num { font-size: 12px; font-weight: 600; }
.dof_count { align-self: flex-start; font-size: 10px; color: #fff; background: #3A53A4; border-radius: 8px; padding: 0 4px; }
.dof_name { font-size: 10px; color: #3A53A4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
