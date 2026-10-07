<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/LVM10000">
			<template #end>
				<ion-button @click="onExport"><ion-icon slot="icon-only" :icon="downloadOutline" /></ion-button>
			</template>
			<template #bottom>
				<ion-toolbar>
					<ion-segment :value="store.showInactive ? 'trash' : 'active'" @ion-change="store.setShowInactive($event.detail.value === 'trash')">
						<ion-segment-button value="active"><ion-label>{{ tr("SHOW_ACTIVE") }}</ion-label></ion-segment-button>
						<ion-segment-button value="trash"><ion-label>{{ tr("SHOW_TRASH") }}</ion-label></ion-segment-button>
					</ion-segment>
				</ion-toolbar>
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<ion-list v-if="store.rows.length" class="scr_list">
				<ion-item-sliding v-for="r in store.rows" :key="r.leaveTypeId">
					<ion-item>
						<ion-label>
							<p class="lvm_code">{{ r.code }}</p>
							<h2>{{ r.name }} <span v-if="r.nameKhmer" class="lvm_km">{{ r.nameKhmer }}</span></h2>
							<p>{{ tr("COL_DAYS_YEAR") }}: {{ r.defaultDaysPerYear }} · {{ tr("COL_MAX_CONSECUTIVE") }}: {{ r.maxConsecutiveDays ?? "—" }}</p>
							<div class="lvm_tags">
								<ion-badge :color="r.isPaid ? 'success' : 'medium'">{{ r.isPaid ? tr("PAID") : tr("UNPAID") }}</ion-badge>
								<ion-badge v-if="r.requiresAttachment" color="tertiary">{{ tr("ATTACHMENT_REQUIRED") }}</ion-badge>
							</div>
						</ion-label>
						<ion-badge slot="end" :color="r.isActive ? 'success' : 'medium'">{{ r.isActive ? tr("ACTIVE") : tr("INACTIVE") }}</ion-badge>
					</ion-item>
					<ion-item-options side="end">
						<template v-if="r.isActive">
							<ion-item-option @click="openEdit(r)">{{ tr("EDIT") }}</ion-item-option>
							<ion-item-option color="danger" @click="onDelete(r)">{{ tr("DELETE") }}</ion-item-option>
						</template>
						<ion-item-option v-else color="success" @click="store.restore(r.leaveTypeId, onActFail)">{{ tr("RESTORE") }}</ion-item-option>
					</ion-item-options>
				</ion-item-sliding>
			</ion-list>
			<bm-empty-state v-else-if="!store.loading" />

			<ion-fab v-if="!store.showInactive" slot="fixed" vertical="bottom" horizontal="end">
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
import { LVM20000Store } from "@/store/POS/LVM/LVM20000Store";
import LeaveTypeCreateModal from "@/views/POS/LVM/LeaveTypeCreateModal.vue";
import type { LeaveType } from "@/models/POS/LVM/LVM20000";

/** Leave types: active / trash views, create/edit sheet, soft delete + restore (unpaged, as on the web). */
defineOptions({ name: "LVM20000" });

const { t } = useI18n();
const tr = (k: string) => t(`LVM20000.${k}`);
const store = LVM20000Store();

useViewEnter(() => store.reload());
async function onRefresh(ev: RefresherCustomEvent): Promise<void> { store.reload(); await ev.target.complete(); }

function onActFail(ok: boolean, error?: unknown): void {
	if (!ok) POP.apiError(error as { code?: string; message?: string } | undefined, tr("ACT_FAILED"));
}
function openCreate(): void {
	POP.showPopup(LeaveTypeCreateModal, { title: tr("CREATE_TITLE"), props: {} }).promise.then(() => store.reload()).catch(() => undefined);
}
function openEdit(type: LeaveType): void {
	POP.showPopup(LeaveTypeCreateModal, { title: tr("EDIT_TITLE"), props: { type } }).promise.then(() => store.reload()).catch(() => undefined);
}
function onDelete(type: LeaveType): void {
	POP.confirm({ title: tr("DELETE_TITLE"), content: `${type.name} (${type.code})`, okBtn: { btnText: tr("DELETE"), onClick: () => store.remove(type.leaveTypeId, onActFail) } });
}
function onExport(): void {
	const cfg = EXPORT_CONFIGS.LVT;
	POP.showPopup(ExportModal, { title: t(`${cfg.trKey}.PAGE_TITLE`), props: { config: cfg } }).promise.catch(() => undefined);
}
</script>

<style scoped>
.lvm_code { font-size: 12px; }
.lvm_km { font-size: 12px; color: var(--ion-color-medium); }
.lvm_tags { display: flex; gap: 4px; margin-top: 4px; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
