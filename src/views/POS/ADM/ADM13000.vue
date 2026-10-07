<template>
	<ion-page>
		<ion-content class="ion-padding">
			<div class="adm_result">
				<ion-icon :icon="checkmarkCircle" color="success" class="adm_mark" />
				<h1>{{ tr("CREATED") }}</h1>
				<p v-if="result" class="adm_name">{{ result.name }}</p>
				<p v-if="result" class="adm_code">{{ result.username }}</p>
				<p class="adm_hint">{{ tr("HANDOVER_HINT") }}</p>
				<ion-button expand="block" :disabled="!result" @click="viewDetail">{{ tr("VIEW") }}</ion-button>
				<ion-button expand="block" fill="outline" @click="router.replace('/ADM11000')">{{ tr("NEW") }}</ion-button>
				<ion-button expand="block" fill="clear" @click="router.replace('/ADM10000')">{{ tr("LIST") }}</ion-button>
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
import type { UserResult } from "@/models/POS/ADM/ADM11000";

/** ADM13000 — user created (step 3). */
defineOptions({ name: "ADM13000" });

const { t } = useI18n();
const tr = (k: string) => t(`ADM13000.${k}`);
const router = useRouter();
const result = ref<UserResult | null>(null);

useViewEnter(() => {
	result.value = ModuleFlowStore.loadResult("ADM") as UserResult | null;
	if (!result.value) router.replace("/ADM10000");
});

function viewDetail(): void {
	router.replace(`/ADM14000?targetUserId=${encodeURIComponent(result.value?.userId ?? "")}`);
}
</script>

<style scoped>
.adm_result { text-align: center; padding-top: 16px; }
.adm_mark { font-size: 64px; }
.adm_result h1 { font-size: 16px; font-weight: 700; margin: 12px 0 4px; }
.adm_name { font-size: 16px; margin: 0 0 4px; }
.adm_code { font-size: 14px; font-family: monospace; margin: 0 0 8px; }
.adm_hint { font-size: 12px; color: var(--ion-color-medium); margin-bottom: 16px; }
</style>
