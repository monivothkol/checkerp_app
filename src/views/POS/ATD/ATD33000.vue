<template>
	<ion-page>
		<ion-content class="ion-padding">
			<div class="atd_result">
				<ion-icon :icon="checkmarkCircle" color="success" class="atd_mark" />
				<h1>{{ tr("CREATED") }}</h1>
				<p v-if="result"><strong v-if="result.scheduleCode">{{ result.scheduleCode }}</strong> {{ result.name }}</p>
				<ion-button expand="block" :disabled="!result" @click="viewDetail">{{ tr("VIEW") }}</ion-button>
				<ion-button expand="block" fill="outline" @click="router.replace('/ATD31000')">{{ tr("NEW") }}</ion-button>
				<ion-button expand="block" fill="clear" @click="router.replace('/ATD30000')">{{ tr("LIST") }}</ion-button>
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
import type { ScheduleResult } from "@/models/POS/ATD/ATD30000";

/** New work schedule, step 3: result + next steps. */
defineOptions({ name: "ATD33000" });

const { t } = useI18n();
const router = useRouter();
const tr = (k: string) => t(`ATD33000.${k}`);
const result = ref<ScheduleResult | null>(null);

useViewEnter(() => {
	result.value = ModuleFlowStore.loadResult("ATD") as ScheduleResult | null;
	if (!result.value) router.replace("/ATD30000");
});
function viewDetail(): void {
	router.replace(`/ATD34000?scheduleId=${encodeURIComponent(result.value?.scheduleId ?? "")}`);
}
</script>

<style scoped>
.atd_result { text-align: center; padding-top: 32px; }
.atd_result h1 { font-size: 16px; font-weight: 700; margin: 8px 0; }
.atd_result p { font-size: 14px; margin: 0 0 16px; }
.atd_mark { font-size: 64px; }
</style>
