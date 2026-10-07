<template>
	<ion-page>
		<ion-content class="ion-padding">
			<div v-if="result" class="sal_res">
				<ion-icon :icon="checkmarkCircle" color="success" class="sal_res_mark" />
				<h1>{{ tr("CREATED") }}</h1>
				<p class="sal_res_code">{{ result.packagingCode }}</p>
				<p class="sal_res_note">{{ tr("PENDING_NOTE") }}</p>
				<ion-button expand="block" @click="router.replace(`/SAL34000?packagingId=${encodeURIComponent(result.packagingId ?? '')}`)">{{ tr("VIEW") }}</ion-button>
				<ion-button expand="block" fill="outline" @click="router.replace('/SAL31000')">{{ tr("NEW") }}</ion-button>
				<ion-button expand="block" fill="clear" @click="router.replace('/SAL30000')">{{ tr("LIST") }}</ion-button>
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

interface PackagingResult { packagingCode?: string; packagingId?: string }

/** Packing create step 3: created (PENDING), and where to go next. */
defineOptions({ name: "SAL33000" });

const { t } = useI18n();
const tr = (k: string) => t(`SAL33000.${k}`);
const router = useRouter();
const result = ref<PackagingResult | null>(null);

useViewEnter(() => {
	result.value = ModuleFlowStore.loadResult("PACKAGING") as PackagingResult | null;
	if (!result.value) router.replace("/SAL30000");
});
</script>

<style scoped>
.sal_res { text-align: center; padding-top: 48px; }
.sal_res_mark { width: 64px; height: 64px; }
.sal_res h1 { font-size: 16px; font-weight: 700; }
.sal_res_code { font-size: 14px; font-weight: 600; }
.sal_res_note { font-size: 12px; color: var(--ion-color-medium); }
.sal_res ion-button { margin-top: 8px; }
</style>
