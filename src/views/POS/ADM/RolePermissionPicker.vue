<template>
	<div>
		<ion-item lines="none" class="rpp_bar">
			<ion-label>{{ picker.selected.length }} {{ t(`${ns}.SELECTED`) }}</ion-label>
			<ion-button slot="end" fill="clear" size="small" @click="picker.selectAll()">{{ t(`${ns}.SELECT_ALL`) }}</ion-button>
			<ion-button slot="end" fill="clear" size="small" @click="picker.clearAll()">{{ t(`${ns}.CLEAR`) }}</ion-button>
		</ion-item>
		<ion-list v-for="grp in picker.groups" :key="grp.resource" class="scr_list rpp_group" lines="none">
			<ion-item>
				<ion-checkbox :checked="picker.isGroupAll(grp)" :indeterminate="picker.isGroupSome(grp)" justify="start" label-placement="end"
					@ion-change="picker.toggleGroup(grp)">
					<strong>{{ grp.resource }}</strong>
				</ion-checkbox>
			</ion-item>
			<div class="rpp_items">
				<ion-chip v-for="p in grp.items" :key="p.permissionCode" :outline="!picker.selected.includes(p.permissionCode)"
					:color="picker.selected.includes(p.permissionCode) ? 'primary' : 'dark'" @click="picker.toggleOne(p.permissionCode)">
					<ion-icon v-if="picker.selected.includes(p.permissionCode)" :icon="checkmark" />
					<ion-label>{{ p.action }}</ion-label>
				</ion-chip>
			</div>
		</ion-list>
	</div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { checkmark } from "ionicons/icons";

/** Grouped permission picker shared by ADM21000 / ADM25000; drives the screen store's selection actions. */
defineOptions({ name: "RolePermissionPicker" });

interface Perm { permissionCode: string; action: string }
interface Group { resource: string; items: Perm[] }
export interface PermissionPickerStore {
	groups: Group[];
	selected: string[];
	isGroupAll(g: Group): boolean;
	isGroupSome(g: Group): boolean;
	toggleOne(code: string): void;
	toggleGroup(g: Group): void;
	selectAll(): void;
	clearAll(): void;
}

defineProps<{ picker: PermissionPickerStore; ns: string }>();
const { t } = useI18n();
</script>

<style scoped>
.rpp_bar ion-label { font-size: 12px; }
.rpp_bar ion-button { margin-left: 8px; }
.rpp_group { margin-bottom: 4px; }
.rpp_items { display: flex; flex-wrap: wrap; gap: 4px; padding: 0 12px 8px 48px; }
ion-chip { font-size: 12px; margin: 0; }
</style>
