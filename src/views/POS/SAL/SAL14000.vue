<template>
	<ion-page>
		<ion-content class="ion-padding">
			<div v-if="result" class="sal_res">
				<ion-icon :icon="checkmarkCircle" color="success" class="sal_res_mark" />
				<h1>{{ tr("CREATED") }}</h1>
				<p>{{ result.customerName }}</p>
				<p class="sal_res_code">{{ result.quotationNo }}</p>
				<ion-button expand="block" @click="router.replace(`/SAL15000?quotationNo=${encodeURIComponent(result.quotationNo ?? '')}`)">{{ tr("VIEW") }}</ion-button>
				<ion-button expand="block" fill="outline" @click="router.replace('/SAL12000')">{{ tr("NEW") }}</ion-button>
				<ion-button expand="block" fill="clear" @click="router.replace('/SAL11000')">{{ tr("LIST") }}</ion-button>
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
import type { QuotationResult } from "@/models/POS/SAL/SAL12000";

/** Quotation create step 3: what was created, and where to go next. */
defineOptions({ name: "SAL14000" });

const { t } = useI18n();
const tr = (k: string) => t(`SAL14000.${k}`);
const router = useRouter();
const result = ref<QuotationResult | null>(null);

useViewEnter(() => {
	result.value = ModuleFlowStore.loadResult("SAL") as QuotationResult | null;
	if (!result.value) router.replace("/SAL11000");
});
</script>

<style scoped>
.sal_res { text-align: center; padding-top: 48px; }
.sal_res_mark { width: 64px; height: 64px; }
.sal_res h1 { font-size: 16px; font-weight: 700; }
.sal_res_code { font-size: 14px; font-weight: 600; }
.sal_res ion-button { margin-top: 8px; }
</style>
