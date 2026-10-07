<template>
	<ion-page>
		<ion-content class="ion-padding">
			<div class="pur_res">
				<ion-icon :icon="checkmarkCircle" color="success" class="pur_mark" />
				<h1>{{ tr("CREATED") }}</h1>
				<p v-if="result" class="pur_code">{{ result.adjustmentCode }}</p>
				<p class="pur_note">{{ tr("PENDING_NOTE") }}</p>
				<ion-button expand="block" :disabled="!result" @click="viewDetail">{{ tr("VIEW") }}</ion-button>
				<ion-button expand="block" fill="outline" @click="router.replace('/PUR21000')">{{ tr("NEW") }}</ion-button>
				<ion-button expand="block" fill="clear" @click="router.replace('/PUR20000')">{{ tr("LIST") }}</ion-button>
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
import type { PurchaseInResult } from "@/models/POS/PUR/PUR21000";

/** Purchase-in created: code + next steps. */
defineOptions({ name: "PUR23000" });

const { t } = useI18n();
const tr = (k: string) => t(`PUR23000.${k}`);
const router = useRouter();
const result = ref<PurchaseInResult | null>(null);

function viewDetail(): void {
	router.replace(`/PUR24000?adjustmentId=${encodeURIComponent(result.value?.adjustmentId ?? "")}`);
}
useViewEnter(() => {
	result.value = ModuleFlowStore.loadResult("PURIN") as PurchaseInResult | null;
	if (!result.value) router.replace("/PUR20000");
});
</script>

<style scoped>
.pur_res { text-align: center; padding-top: 48px; }
.pur_mark { font-size: 64px; }
.pur_res h1 { font-size: 16px; font-weight: 700; margin: 12px 0 8px; }
.pur_code { font-size: 16px; font-weight: 600; }
.pur_note { font-size: 14px; color: var(--ion-color-medium); margin-bottom: 16px; }
</style>
