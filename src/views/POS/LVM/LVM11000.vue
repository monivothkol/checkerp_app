<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/LVM10000" />
		<ion-content>
			<ion-list class="scr_list" lines="full">
				<ion-item>
					<ion-select v-model="store.staffId" :label="tr('STAFF')" label-placement="stacked" :placeholder="tr('MYSELF_PH')" interface="alert" :interface-options="{ header: tr('STAFF') }">
						<ion-select-option :value="undefined">{{ tr("MYSELF") }}</ion-select-option>
						<ion-select-option v-for="s in store.staffOptions" :key="s.id" :value="s.id">{{ s.name }}</ion-select-option>
					</ion-select>
				</ion-item>
				<ion-item>
					<ion-select v-model="store.leaveTypeId" :label="`${tr('LEAVE_TYPE')} *`" label-placement="stacked" :placeholder="tr('LEAVE_TYPE_PH')" interface="action-sheet">
						<ion-select-option v-for="x in store.types" :key="x.leaveTypeId" :value="x.leaveTypeId">{{ x.name }}</ion-select-option>
					</ion-select>
				</ion-item>
				<ion-item><ion-input :value="store.startDate" type="date" :label="`${tr('DATES')} ▸ *`" label-placement="stacked" @ion-change="setDates(String($event.detail.value ?? ''), store.endDate)" /></ion-item>
				<ion-item><ion-input :value="store.endDate" type="date" :label="`${tr('DATES')} ◂ *`" label-placement="stacked" :disabled="store.isHalfDay" @ion-change="setDates(store.startDate, String($event.detail.value ?? ''))" /></ion-item>
				<ion-item>
					<ion-toggle :checked="store.isHalfDay" @ion-change="store.onHalfDayToggle($event.detail.checked)">{{ tr("HALF_DAY") }}</ion-toggle>
				</ion-item>
				<ion-item>
					<ion-label>{{ tr("TOTAL_DAYS") }}</ion-label>
					<ion-note slot="end" class="lvm_days">{{ store.totalDays }}</ion-note>
				</ion-item>
				<ion-item>
					<ion-textarea v-model="store.reason" :label="tr('REASON')" label-placement="stacked" :placeholder="tr('REASON_PH')" :rows="2" auto-grow />
				</ion-item>

				<!-- approval line builder -->
				<ion-list-header>{{ tr("APPROVAL_LINE") }}</ion-list-header>
				<ion-item v-for="(a, i) in store.approvers" :key="a.value">
					<ion-badge slot="start" color="primary">{{ i + 1 }}</ion-badge>
					<ion-label :color="a.value === 'DEPT_HEAD' ? 'warning' : undefined">{{ a.value === "DEPT_HEAD" ? tr("DEPT_HEAD") : a.name }}</ion-label>
					<ion-button slot="end" fill="clear" size="small" :disabled="i === 0" @click="store.moveApprover(i, -1)"><ion-icon slot="icon-only" :icon="arrowUp" /></ion-button>
					<ion-button slot="end" fill="clear" size="small" :disabled="i === store.approvers.length - 1" @click="store.moveApprover(i, 1)"><ion-icon slot="icon-only" :icon="arrowDown" /></ion-button>
					<ion-button slot="end" fill="clear" size="small" color="danger" @click="store.removeApprover(i)"><ion-icon slot="icon-only" :icon="close" /></ion-button>
				</ion-item>
				<ion-item v-if="!store.approvers.length" lines="none"><ion-note class="lvm_hint">{{ tr("NO_APPROVERS") }}</ion-note></ion-item>
				<ion-item>
					<ion-select v-model="store.approverPick" :placeholder="tr('ADD_APPROVER_PH')" interface="alert" :interface-options="{ header: tr('ADD_APPROVER_PH') }" @ion-change="store.onPickApprover(String($event.detail.value ?? ''))">
						<ion-select-option v-for="s in store.staffOptions" :key="s.id" :value="s.id">{{ s.name }}</ion-select-option>
					</ion-select>
					<ion-button slot="end" fill="outline" size="small" @click="store.addDeptHead(tr('DEPT_HEAD'))">
						<ion-icon slot="start" :icon="peopleOutline" /> {{ tr("ADD_DEPT_HEAD") }}
					</ion-button>
				</ion-item>

				<ion-item>
					<ion-select v-model="store.followerStaffIds" :label="tr('FOLLOWERS')" label-placement="stacked" :placeholder="tr('FOLLOWERS_PH')" :multiple="true" interface="alert" :interface-options="{ header: tr('FOLLOWERS') }">
						<ion-select-option v-for="s in store.staffOptions" :key="s.id" :value="s.id">{{ s.name }}</ion-select-option>
					</ion-select>
				</ion-item>
			</ion-list>
		</ion-content>
		<ion-footer>
			<ion-toolbar>
				<div class="lvm_btns">
					<ion-button fill="outline" @click="router.push('/LVM10000')">{{ tr("CANCEL") }}</ion-button>
					<ion-button :disabled="!store.canConfirm" @click="confirm">{{ tr("CONFIRM") }}</ion-button>
				</div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { arrowDown, arrowUp, close, peopleOutline } from "ionicons/icons";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { LVM11000Store } from "@/store/POS/LVM/LVM11000Store";

/** New leave request, step 1: type, dates, half-day, approval line + followers → draft → LVM12000. */
defineOptions({ name: "LVM11000" });

const { t } = useI18n();
const router = useRouter();
const tr = (k: string) => t(`LVM11000.${k}`);
const store = LVM11000Store();

useViewEnter(() => { store.loadStaff(); store.loadTypes(); });

/** Two date inputs stand in for the web range picker; half-day pins the end to the start. */
function setDates(start: string, end: string): void {
	store.dateRange = [start, end];
	store.onDatesChange();
}
function confirm(): void {
	if (store.buildAndSaveDraft(tr("MYSELF"))) router.push("/LVM12000");
}
</script>

<style scoped>
.lvm_days { font-size: 16px; font-weight: 700; color: var(--ion-color-dark); }
.lvm_hint { font-size: 12px; }
.lvm_btns { display: flex; gap: 8px; padding: 0 8px; }
.lvm_btns ion-button { flex: 1; }
</style>
