<template>
	<ion-page>
		<ion-content class="ion-padding">
			<div class="prm_result">
				<ion-icon :icon="checkmarkCircle" color="success" class="prm_mark" />
				<h1>{{ tr("CREATED") }}</h1>
				<p v-if="result">{{ result.staffName }} — {{ result.typeName }}</p>
				<ion-button expand="block" :disabled="!result" @click="viewDetail">{{ tr("VIEW") }}</ion-button>
				<ion-button expand="block" fill="outline" @click="router.replace('/PRM21000')">{{ tr("NEW") }}</ion-button>
				<ion-button expand="block" fill="clear" @click="router.replace('/PRM20000')">{{ tr("LIST") }}</ion-button>
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
import type { AdjustmentResult } from "@/models/POS/PRM/PRM21000";

/** New payroll adjustment, step 3: result + next steps. */
defineOptions({ name: "PRM23000" });

const { t } = useI18n();
const router = useRouter();
const tr = (k: string) => t(`PRM23000.${k}`);
const result = ref<AdjustmentResult | null>(null);

useViewEnter(() => {
	result.value = ModuleFlowStore.loadResult("PRM") as AdjustmentResult | null;
	if (!result.value) router.replace("/PRM20000");
});
function viewDetail(): void {
	router.replace(`/PRM24000?adjustmentId=${encodeURIComponent(result.value?.adjustmentId ?? "")}`);
}
</script>

<style scoped>
.prm_result { text-align: center; padding-top: 32px; }
.prm_result h1 { font-size: 16px; font-weight: 700; margin: 8px 0; }
.prm_result p { font-size: 14px; margin: 0 0 16px; }
.prm_mark { font-size: 64px; }
</style>
