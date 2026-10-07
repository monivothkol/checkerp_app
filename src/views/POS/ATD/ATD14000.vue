<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/ATD10000" />
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<ion-list v-else-if="store.detail" class="scr_list" lines="full">
				<ion-item>
					<ion-label><p>{{ tr("DATE") }}</p><h3>{{ String(store.detail.date ?? "").slice(0, 10) }}</h3></ion-label>
					<ion-badge slot="end" :color="statusColor(store.detail.status)">{{ tr("STATUS_" + store.detail.status) }}</ion-badge>
				</ion-item>
				<ion-item><ion-label><p>{{ tr("STAFF") }}</p><h3>{{ store.detail.staffName }} <span class="atd_code">{{ store.detail.staffCode }}</span></h3></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("CHECK_IN") }}</p><h3>{{ hhmm(store.detail.checkIn) }}</h3></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("BREAK_OUT") }}</p><h3>{{ hhmm(store.detail.breakCheckOut) }}</h3></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("BREAK_IN") }}</p><h3>{{ hhmm(store.detail.breakCheckIn) }}</h3></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("CHECK_OUT") }}</p><h3>{{ hhmm(store.detail.checkOut) }}</h3></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("WORKED") }}</p><h3>{{ fmtMinutes(store.detail.workedMinutes) }}</h3></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("BREAK_TIME") }}</p><h3>{{ fmtMinutes(store.detail.breakMinutes) }}</h3></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("LATE") }}</p><h3>{{ Number(store.detail.lateMinutes ?? 0) > 0 ? fmtMinutes(store.detail.lateMinutes) : "—" }}</h3></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("SOURCE") }}</p><h3>{{ store.detail.source || "—" }}</h3></ion-label></ion-item>
				<ion-item v-if="store.detail.remark"><ion-label class="ion-text-wrap"><p>{{ tr("REMARK") }}</p><h3>{{ store.detail.remark }}</h3></ion-label></ion-item>
			</ion-list>
			<bm-empty-state v-else description="ATD14000.NOT_FOUND" />
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { ATD14000Store } from "@/store/POS/ATD/ATD14000Store";

/** Attendance record detail (punch times, worked/break/late minutes). */
defineOptions({ name: "ATD14000" });

const { t } = useI18n();
const route = useRoute();
const tr = (k: string) => t(`ATD14000.${k}`);
const store = ATD14000Store();
useViewEnter(() => store.load(String(route.query.attendanceId ?? "")));

function hhmm(v: unknown): string {
	const s = String(v ?? "");
	if (!s) return "—";
	const time = s.includes("T") ? s.split("T")[1] : s.includes(" ") ? s.split(" ")[1] : s;
	return time ? time.slice(0, 5) : "—";
}
function fmtMinutes(v: unknown): string {
	const m = Number(v ?? 0);
	return m ? `${Math.floor(m / 60)}h ${m % 60}m` : "—";
}
function statusColor(s: string): string {
	if (s === "PRESENT") return "success";
	return s === "LATE" ? "warning" : "medium";
}
</script>

<style scoped>
.atd_code { font-size: 12px; color: var(--ion-color-medium); }
ion-label h3 { font-size: 14px; }
</style>
