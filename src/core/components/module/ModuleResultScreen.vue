<template>
	<ion-page>
		<ion-content class="ion-padding">
			<div v-if="result" class="mrs">
				<ion-icon :icon="checkmarkCircle" color="success" class="mrs_mark" />
				<h1>{{ tr("CREATED") }}</h1>
				<p class="mrs_code">{{ result[config.codeKey] }}</p>
				<p>{{ result[config.nameKey] }}</p>
				<ion-button expand="block" @click="onDetail">{{ tr("VIEW_DETAIL") }}</ion-button>
				<ion-button expand="block" fill="outline" @click="router.replace(config.createRoute)">{{ tr("CREATE_ANOTHER") }}</ion-button>
				<ion-button expand="block" fill="clear" @click="router.replace(config.listRoute)">{{ tr("BACK_TO_LIST") }}</ion-button>
			</div>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { checkmarkCircle } from "ionicons/icons";
import { ModuleFlowStore, type ModuleScreenConfig } from "@/core/modules/module-screen-config";

/** Config-driven create step 3: what was created, and where to go next. */
defineOptions({ name: "ModuleResultScreen" });

const props = defineProps<{ config: ModuleScreenConfig }>();
const { t } = useI18n();
const router = useRouter();
const tr = (key: string) => t(`${props.config.resultTr ?? props.config.module + "40000"}.${key}`);
const result = ref<Record<string, any> | null>(null);

useViewEnter(() => {
	result.value = ModuleFlowStore.loadResult(props.config.module);
	if (!result.value) router.replace(props.config.listRoute);
});

function onDetail(): void {
	const c = props.config;
	router.replace(`${c.detailRoute}?${c.codeKey}=${encodeURIComponent(String(result.value?.[c.codeKey] ?? ""))}`);
}
</script>

<style scoped>
.mrs { text-align: center; padding-top: 48px; }
.mrs_mark { font-size: 64px; }
.mrs h1 { font-size: 16px; font-weight: 700; }
.mrs_code { font-size: 14px; font-weight: 600; }
.mrs ion-button { margin-top: 8px; }
</style>
