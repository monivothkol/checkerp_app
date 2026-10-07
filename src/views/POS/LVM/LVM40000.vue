<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #bottom>
				<ion-toolbar>
					<div class="lvm_filters">
						<ion-select v-model="store.staffId" :placeholder="tr('ALL_STAFF')" interface="alert" :interface-options="{ header: tr('ALL_STAFF') }" @ion-change="store.onStaffChange()">
							<ion-select-option :value="undefined">{{ tr("ALL_STAFF") }}</ion-select-option>
							<ion-select-option v-for="s in store.staffOptions" :key="s.id" :value="s.id">{{ s.name }}</ion-select-option>
						</ion-select>
						<ion-select :value="store.year" interface="action-sheet" @ion-change="store.onYearChange(Number($event.detail.value))">
							<ion-select-option v-for="y in years" :key="y" :value="y">{{ y }}</ion-select-option>
						</ion-select>
					</div>
				</ion-toolbar>
			</template>
		</bm-header>

		<ion-content>
			<!-- Summary cards: per-type used vs total for the year -->
			<div class="lvm_cards">
				<div v-for="s in store.summary" :key="s.leaveTypeId" class="lvm_card">
					<div class="lvm_card_name">{{ s.leaveTypeName }}</div>
					<div class="lvm_card_val"><strong>{{ num(s.usedDays) }}</strong> / {{ num(s.totalDays) }}</div>
					<div class="lvm_card_lbl">{{ tr("USED_OF_TOTAL") }}</div>
				</div>
			</div>
			<bm-empty-state v-if="!store.loadingSummary && !store.summary.length" description="LVM40000.NO_SUMMARY" />

			<bm-empty-state v-if="!store.staffId" description="LVM40000.PICK_STAFF" />
			<template v-else>
				<ion-progress-bar v-if="store.loadingBalances" type="indeterminate" />
				<ion-list class="scr_list" lines="full">
					<ion-item v-for="b in store.balances" :key="b.leaveTypeId">
						<ion-label>
							<h3>{{ b.leaveTypeName }} <span class="lvm_code">{{ b.code }}</span></h3>
							<p>{{ tr("COL_TOTAL") }}: {{ num(b.totalDays) }} · {{ tr("COL_CARRIED") }}: {{ num(b.carriedDays) }} · {{ tr("COL_USED") }}: {{ num(b.usedDays) }}</p>
						</ion-label>
						<div slot="end" class="lvm_remaining">
							<span>{{ tr("COL_REMAINING") }}</span>
							<strong :class="{ lvm_zero: num(b.remainingDays) <= 0 }">{{ num(b.remainingDays) }}</strong>
						</div>
					</ion-item>
				</ion-list>
			</template>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { LVM40000Store } from "@/store/POS/LVM/LVM40000Store";

/** Leave balances: company/staff summary per type for a year; per-staff balances once a staff is picked. */
defineOptions({ name: "LVM40000" });

const { t } = useI18n();
const tr = (k: string) => t(`LVM40000.${k}`);
const store = LVM40000Store();
const now = new Date().getFullYear();
const years = [now + 1, now, now - 1, now - 2];
const num = (v: unknown) => Number(v ?? 0);

useViewEnter(() => { store.loadStaff(); store.reload(); });
</script>

<style scoped>
.lvm_filters { display: flex; gap: 8px; padding: 0 16px; }
.lvm_filters > :first-child { flex: 1; min-width: 0; }
.lvm_cards { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 8px 16px; }
.lvm_card { padding: 12px; border-radius: 8px; background: var(--ion-color-light); }
.lvm_card_name { font-size: 12px; font-weight: 700; color: var(--ion-color-medium); text-transform: uppercase; }
.lvm_card_val { font-size: 16px; margin: 4px 0; }
.lvm_card_lbl { font-size: 10px; color: var(--ion-color-medium); }
.lvm_code { font-size: 12px; color: var(--ion-color-medium); }
.lvm_remaining { display: flex; flex-direction: column; align-items: flex-end; font-size: 10px; color: var(--ion-color-medium); }
.lvm_remaining strong { font-size: 16px; color: var(--ion-color-dark); }
.lvm_remaining strong.lvm_zero { color: var(--ion-color-danger); }
ion-label h3 { font-size: 14px; }
ion-label p { font-size: 12px; }
</style>
