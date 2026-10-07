<template>
	<ion-page>
		<bm-header :title="t('ADM21000.PAGE_TITLE')" default-href="/ADM20000" />
		<ion-content>
			<ion-list class="scr_list" lines="full">
				<ion-item><ion-input v-model="store.form.roleName" :label="`${t('ADM21000.FIELD_ROLE_NAME')} *`" label-placement="stacked" placeholder="e.g. Sales Clerk" /></ion-item>
				<ion-item><ion-textarea v-model="store.form.description" :label="t('ADM21000.FIELD_DESCRIPTION')" label-placement="stacked" :auto-grow="true" :rows="2" /></ion-item>
			</ion-list>

			<ion-list-header>{{ t("ADM21000.PERMISSIONS") }}</ion-list-header>
			<ion-progress-bar v-if="store.loadingPerms" type="indeterminate" />
			<bm-empty-state v-else-if="store.groups.length === 0" :description="'ADM21000.NO_PERMISSIONS'" />
			<RolePermissionPicker v-else :picker="store" ns="ADM21000" />
			<ion-note v-if="store.permError" color="danger" class="adm_err">{{ t("ADM21000.ERR_PICK_ONE") }}</ion-note>
		</ion-content>
		<ion-footer>
			<ion-toolbar>
				<div class="adm_btns">
					<ion-button fill="outline" @click="onCancel">{{ t("ADM21000.CANCEL") }}</ion-button>
					<ion-button @click="onNext">{{ t("ADM21000.NEXT") }}</ion-button>
				</div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import POP from "@/core/utilities/pop";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { ADM21000Store } from "@/store/POS/ADM/ADM21000Store";
import RolePermissionPicker from "@/views/POS/ADM/RolePermissionPicker.vue";

/** ADM21000 — new role form (step 1): name, description, grantable permissions. */
defineOptions({ name: "ADM21000" });

const { t } = useI18n();
const router = useRouter();
const store = ADM21000Store();

useViewEnter(() => {
	store.restoreDraft();
	store.loadPermissions();
});

function onCancel(): void {
	store.clearDraft();
	router.push("/ADM20000");
}
function onNext(): void {
	if (!store.form.roleName?.trim()) {
		POP.alert({ status: "error", content: t("POP.REQUIRED", { field: t("ADM21000.FIELD_ROLE_NAME") }) });
		return;
	}
	if (store.buildAndSaveDraft()) router.push("/ADM22000");
}
</script>

<style scoped>
.adm_btns { display: flex; gap: 8px; padding: 8px 16px; }
.adm_btns ion-button { flex: 1; }
.adm_err { display: block; padding: 8px 16px; font-size: 12px; }
ion-list-header { font-size: 14px; font-weight: 600; }
</style>
