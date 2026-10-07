<template>
	<ion-page>
		<ion-content class="ion-padding">
			<div class="pur_res">
				<ion-icon :icon="checkmarkCircle" color="success" class="pur_mark" />
				<h1>{{ tr("CREATED") }}</h1>
				<p v-if="result" class="pur_code">{{ result.poCode }}</p>
				<p class="pur_note">{{ tr("DRAFT_NOTE") }}</p>
				<ion-button expand="block" :disabled="!result" @click="viewDetail">{{ tr("VIEW") }}</ion-button>
				<ion-button expand="block" fill="outline" @click="router.replace('/PUR11000')">{{ tr("NEW") }}</ion-button>
				<ion-button expand="block" fill="clear" @click="router.replace('/PUR10000')">{{ tr("LIST") }}</ion-button>
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
import type { PoResult } from "@/models/POS/PUR/PUR11000";

/** Purchase-order created: code + next steps. */
defineOptions({ name: "PUR13000" });

const { t } = useI18n();
const tr = (k: string) => t(`PUR13000.${k}`);
const router = useRouter();
const result = ref<PoResult | null>(null);

function viewDetail(): void {
	router.replace(`/PUR14000?poId=${encodeURIComponent(result.value?.poId ?? "")}`);
}
useViewEnter(() => {
	result.value = ModuleFlowStore.loadResult("PUR") as PoResult | null;
	if (!result.value) router.replace("/PUR10000");
});
</script>

<style scoped>
.pur_res { text-align: center; padding-top: 48px; }
.pur_mark { font-size: 64px; }
.pur_res h1 { font-size: 16px; font-weight: 700; margin: 12px 0 8px; }
.pur_code { font-size: 16px; font-weight: 600; }
.pur_note { font-size: 14px; color: var(--ion-color-medium); margin-bottom: 16px; }
</style>
