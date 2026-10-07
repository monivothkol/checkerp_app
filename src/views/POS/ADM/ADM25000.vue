<template>
	<ion-page>
		<bm-header :title="t('ADM25000.PAGE_TITLE')" :default-href="`/ADM24000?roleCode=${roleCode}`" />
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<template v-else>
				<ion-note v-if="store.isSystemRole" class="adm_note">{{ t("ADM25000.SYSTEM_ROLE_NOTE") }}</ion-note>
				<ion-list class="scr_list" lines="full">
					<ion-item><ion-input :value="roleCode" :label="t('ADM24000.CODE')" label-placement="stacked" disabled /></ion-item>
					<ion-item><ion-input v-model="store.form.roleName" :label="`${t('ADM25000.FIELD_ROLE_NAME')} *`" label-placement="stacked" placeholder="e.g. Sales Clerk" :disabled="store.isSystemRole" /></ion-item>
					<ion-item><ion-textarea v-model="store.form.description" :label="t('ADM25000.FIELD_DESCRIPTION')" label-placement="stacked" :auto-grow="true" :rows="2" :disabled="store.isSystemRole" /></ion-item>
				</ion-list>
				<ion-list-header>{{ t("ADM25000.PERMISSIONS") }}</ion-list-header>
				<RolePermissionPicker :picker="store" ns="ADM25000" />
				<ion-note v-if="store.lockedCount > 0" class="adm_note">{{ store.lockedCount }} {{ t("ADM25000.LOCKED_NOTE") }}</ion-note>
				<ion-note v-if="store.permError" color="danger" class="adm_note">{{ t("ADM25000.ERR_PICK_ONE") }}</ion-note>
			</template>
		</ion-content>
		<ion-footer v-if="!store.loading">
			<ion-toolbar>
				<div class="adm_btns">
					<ion-button fill="outline" @click="router.push(`/ADM24000?roleCode=${roleCode}`)">{{ t("ADM25000.CANCEL") }}</ion-button>
					<ion-button :disabled="store.saving" @click="onSave">{{ t("ADM25000.SAVE") }}</ion-button>
				</div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import POP from "@/core/utilities/pop";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { ADM25000Store } from "@/store/POS/ADM/ADM25000Store";
import RolePermissionPicker from "@/views/POS/ADM/RolePermissionPicker.vue";

/** ADM25000 — edit role: name/description (read-only for system roles) + this company's grantable permissions. */
defineOptions({ name: "ADM25000" });

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const store = ADM25000Store();
const roleCode = computed(() => String(route.query.roleCode ?? ""));

watch(() => store.redirectTo, (to) => { if (to) router.push(to); });

useViewEnter(() => {
	if (!roleCode.value) { router.replace("/ADM20000"); return; }
	// The store never clears redirectTo; reset it so a second save of the same role still navigates.
	store.redirectTo = null;
	store.permError = false;
	store.loadAll(roleCode.value);
});

function onSave(): void {
	if (!store.form.roleName?.trim()) {
		POP.alert({ status: "error", content: t("POP.REQUIRED", { field: t("ADM25000.FIELD_ROLE_NAME") }) });
		return;
	}
	store.save(roleCode.value, t("ADM25000.SAVED"), t("ADM25000.SAVED_MSG"), "Could not save");
}
</script>

<style scoped>
.adm_btns { display: flex; gap: 8px; padding: 8px 16px; }
.adm_btns ion-button { flex: 1; }
.adm_note { display: block; padding: 8px 16px; font-size: 12px; }
ion-list-header { font-size: 14px; font-weight: 600; }
</style>
