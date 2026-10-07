<template>
	<ion-page>
		<ion-content class="ion-padding">
			<div class="c33">
				<ion-icon :icon="checkmarkCircle" color="success" class="c33_mark" />
				<h1>{{ tr("CREATED") }}</h1>
				<p v-if="result" class="c33_name">{{ result.name }}</p>
				<ion-button expand="block" :disabled="!result" @click="viewDetail">{{ tr("VIEW") }}</ion-button>
				<ion-button expand="block" fill="outline" @click="router.push('/CUS31000')">{{ tr("NEW") }}</ion-button>
				<ion-button expand="block" fill="clear" @click="router.push('/CUS30000')">{{ tr("LIST") }}</ion-button>
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
import type { LoyaltyResult } from "@/models/POS/CUS/CUS30000";

/** Loyalty condition create (step 3): result + next steps. */
defineOptions({ name: "CUS33000" });

const { t } = useI18n();
const router = useRouter();
const tr = (key: string) => t(`CUS33000.${key}`);
const result = ref<LoyaltyResult | null>(null);

useViewEnter(() => {
	result.value = ModuleFlowStore.loadResult("CUSL") as LoyaltyResult | null;
	if (!result.value) router.replace("/CUS30000");
});

function viewDetail(): void {
	router.replace(`/CUS34000?conditionId=${encodeURIComponent(result.value?.conditionId ?? "")}`);
}
</script>

<style scoped>
.c33 { text-align: center; padding-top: 48px; }
.c33_mark { font-size: 64px; }
.c33 h1 { font-size: 16px; font-weight: 700; }
.c33_name { font-size: 14px; font-weight: 600; }
.c33 ion-button { margin-top: 8px; }
</style>
