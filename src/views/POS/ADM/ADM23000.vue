<template>
	<ion-page>
		<ion-content class="ion-padding">
			<div v-if="result" class="adm_result">
				<ion-icon :icon="checkmarkCircle" color="success" class="adm_mark" />
				<h1>{{ t("ADM23000.CREATED") }}</h1>
				<p class="adm_code">{{ result.roleCode }}</p>
				<p>{{ result.roleName }}</p>
				<ion-button expand="block" @click="router.replace(`/ADM24000?roleCode=${result.roleCode}`)">{{ t("ADM23000.VIEW_DETAIL") }}</ion-button>
				<ion-button expand="block" fill="outline" @click="router.replace('/ADM21000')">{{ t("ADM23000.CREATE_ANOTHER") }}</ion-button>
				<ion-button expand="block" fill="clear" @click="router.replace('/ADM20000')">{{ t("ADM23000.BACK_TO_ROLES") }}</ion-button>
			</div>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { checkmarkCircle } from "ionicons/icons";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";
import type { RoleCreateResult } from "@/models/POS/ADM/ADM20000";

/** ADM23000 — role created (step 3). */
defineOptions({ name: "ADM23000" });

const { t } = useI18n();
const router = useRouter();
const result = ref<RoleCreateResult | null>(null);

useViewEnter(() => {
	result.value = ModuleFlowStore.loadResult("ADMR") as RoleCreateResult | null;
	if (!result.value) router.replace("/ADM20000");
});
</script>

<style scoped>
.adm_result { text-align: center; padding-top: 16px; }
.adm_mark { font-size: 64px; }
.adm_result h1 { font-size: 16px; font-weight: 700; margin: 12px 0 8px; }
.adm_code { font-size: 14px; font-family: monospace; margin: 0 0 4px; }
.adm_result p { font-size: 14px; margin-bottom: 16px; }
</style>
