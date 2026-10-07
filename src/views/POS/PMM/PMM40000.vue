<template>
	<ion-page>
		<bm-header :title="tr('CREATED')" :back-button="false" />
		<ion-content class="ion-padding">
			<div class="pmr_box">
				<ion-icon :icon="checkmarkCircle" color="success" class="pmr_ok" />
				<h2 class="pmr_done">{{ tr("CREATED") }}</h2>
				<p v-if="result" class="pmr_name">{{ result.name }}</p>
				<p v-if="result" class="pmr_code">{{ result.promotionCode }}</p>
			</div>
		</ion-content>
		<ion-footer>
			<ion-toolbar class="pmr_btns">
				<ion-button fill="outline" @click="router.replace('/PMM20000')">{{ tr("NEW") }}</ion-button>
				<ion-button fill="outline" @click="router.replace('/PMM10000')">{{ tr("LIST") }}</ion-button>
				<ion-button :disabled="!result" @click="viewDetail">{{ tr("VIEW") }}</ion-button>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { checkmarkCircle } from "ionicons/icons";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";
import type { PromotionResult } from "@/models/POS/PMM/PMM20000";

/** PMM40000 — promotion created: create another, back to list, or view the new promotion. */
defineOptions({ name: "PMM40000" });

const { t } = useI18n();
const router = useRouter();
const tr = (key: string) => t(`PMM40000.${key}`);
const result = ref<PromotionResult | null>(null);

useViewEnter(() => {
	result.value = ModuleFlowStore.loadResult("PMM") as PromotionResult | null;
	if (!result.value) router.replace("/PMM10000");
});

function viewDetail(): void {
	router.replace(`/PMM50000?promotionCode=${encodeURIComponent(result.value?.promotionCode ?? "")}`);
}
</script>

<style scoped>
.pmr_box { text-align: center; padding: 16px 0; }
.pmr_ok { font-size: 64px; }
.pmr_done { font-size: 16px; font-weight: 700; margin: 12px 0 4px; }
.pmr_name { font-size: 14px; margin: 0 0 4px; }
.pmr_code { font-size: 12px; font-weight: 600; margin: 0; }
.pmr_btns { --padding-start: 8px; --padding-end: 8px; }
.pmr_btns ion-button { width: calc(33.3% - 4px); font-size: 12px; }
</style>
