<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/LVM10000">
			<template #end>
				<ion-button @click="onExport"><ion-icon slot="icon-only" :icon="downloadOutline" /></ion-button>
			</template>
			<template #bottom>
				<ion-toolbar>
					<ion-select v-model="store.yearValue" class="lvm_year" interface="action-sheet" @ion-change="store.reload()">
						<ion-select-option v-for="y in years" :key="y" :value="y">{{ y }}</ion-select-option>
					</ion-select>
				</ion-toolbar>
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<ion-list v-if="store.rows.length" class="scr_list">
				<ion-item v-for="r in store.rows" :key="r.holidayId">
					<ion-label>
						<p class="lvm_code">{{ r.date }}</p>
						<h2>{{ r.name }}</h2>
						<p v-if="r.nameKhmer">{{ r.nameKhmer }}</p>
					</ion-label>
					<ion-badge v-if="r.isRecurring" slot="end" color="tertiary">{{ tr("RECURRING") }}</ion-badge>
				</ion-item>
			</ion-list>
			<bm-empty-state v-else-if="!store.loading" />

			<ion-fab slot="fixed" vertical="bottom" horizontal="end">
				<ion-fab-button @click="openCreate"><ion-icon :icon="add" /></ion-fab-button>
			</ion-fab>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { RefresherCustomEvent } from "@ionic/vue";
import { add, downloadOutline } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import ExportModal from "@/core/components/module/ExportModal.vue";
import { EXPORT_CONFIGS } from "@/core/modules/export-config";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { LVM30000Store } from "@/store/POS/LVM/LVM30000Store";
import HolidayCreateModal from "@/views/POS/LVM/HolidayCreateModal.vue";

/** Company holidays for a year (unpaged, as on the web); create via HolidayCreateModal. */
defineOptions({ name: "LVM30000" });

const { t } = useI18n();
const tr = (k: string) => t(`LVM30000.${k}`);
const store = LVM30000Store();
// Web year picker → a short list around the current year.
const now = new Date().getFullYear();
const years = [now + 1, now, now - 1, now - 2, now - 3].map(String);

useViewEnter(() => store.reload());
async function onRefresh(ev: RefresherCustomEvent): Promise<void> { store.reload(); await ev.target.complete(); }

function openCreate(): void {
	POP.showPopup(HolidayCreateModal, { title: tr("CREATE_TITLE"), props: {} }).promise.then(() => store.reload()).catch(() => undefined);
}
function onExport(): void {
	const cfg = EXPORT_CONFIGS.HOL;
	POP.showPopup(ExportModal, { title: t(`${cfg.trKey}.PAGE_TITLE`), props: { config: cfg } }).promise.catch(() => undefined);
}
</script>

<style scoped>
.lvm_year { padding: 0 16px; }
.lvm_code { font-size: 12px; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
