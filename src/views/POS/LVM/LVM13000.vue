<template>
	<ion-page>
		<ion-content class="ion-padding">
			<div class="lvm_result">
				<ion-icon :icon="checkmarkCircle" color="success" class="lvm_mark" />
				<h1>{{ tr("CREATED") }}</h1>
				<p v-if="result">{{ result.staffName }} · {{ result.typeName }} · {{ result.totalDays }} {{ tr("DAYS_SUFFIX") }}</p>
				<p class="lvm_pending">{{ tr("PENDING_NOTE") }}</p>
				<ion-button expand="block" :disabled="!result" @click="viewDetail">{{ tr("VIEW") }}</ion-button>
				<ion-button expand="block" fill="outline" @click="router.replace('/LVM11000')">{{ tr("NEW") }}</ion-button>
				<ion-button expand="block" fill="clear" @click="router.replace('/LVM10000')">{{ tr("LIST") }}</ion-button>
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
import type { LeaveResult } from "@/models/POS/LVM/LVM10000";

/** New leave request, step 3: result (pending approval) + next steps. */
defineOptions({ name: "LVM13000" });

const { t } = useI18n();
const router = useRouter();
const tr = (k: string) => t(`LVM13000.${k}`);
const result = ref<LeaveResult | null>(null);

useViewEnter(() => {
	result.value = ModuleFlowStore.loadResult("LVM") as LeaveResult | null;
	if (!result.value) router.replace("/LVM10000");
});
function viewDetail(): void {
	router.replace(`/LVM14000?requestId=${encodeURIComponent(result.value?.requestId ?? "")}`);
}
</script>

<style scoped>
.lvm_result { text-align: center; padding-top: 32px; }
.lvm_result h1 { font-size: 16px; font-weight: 700; margin: 8px 0; }
.lvm_result p { font-size: 14px; margin: 0 0 8px; }
.lvm_pending { color: var(--ion-color-medium); margin-bottom: 16px !important; }
.lvm_mark { font-size: 64px; }
</style>
