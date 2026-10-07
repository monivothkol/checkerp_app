<template>
	<ion-page>
		<bm-header :title="$t('PRD14000.PAGE_TITLE')" default-href="/PRD10000" />
		<ion-content class="ion-padding">
			<p v-if="record.productCode" class="pe_code">{{ record.productCode }}</p>
			<ModuleEditModal :key="record.productId" :config="config" :record="record" @ok="onSaved" @cancel="router.back()" />
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import POP from "@/core/utilities/pop";
import ModuleEditModal from "@/core/components/module/ModuleEditModal.vue";
import { MODULE_CONFIGS } from "@/core/modules/module-screen-config";

/** PRD14000 — full-page product edit; the shared edit form (incl. variants) on its own page. */
defineOptions({ name: "PRD14000" });

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const config = MODULE_CONFIGS.PRD;
const record = computed(() => ({ productId: String(route.query.productId ?? ""), productCode: String(route.query.productCode ?? "") }));

function onSaved(): void {
	POP.alert({ status: "success", title: t("PRD14000.SAVED") });
	router.push(`/PRD50000?productCode=${encodeURIComponent(record.value.productCode)}`);
}
</script>

<style scoped>
.pe_code { font-size: 12px; font-weight: 600; margin: 0 0 8px; }
</style>
