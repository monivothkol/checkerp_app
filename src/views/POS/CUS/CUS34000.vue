<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/CUS30000" />
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<ion-list v-else-if="store.detail" class="scr_list" lines="full">
				<ion-item><ion-label><p>{{ tr("NAME") }}</p><h3 class="c34_value">{{ store.detail.conditionName }}</h3></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("TYPE") }}</p><h3 class="c34_value">{{ tr("TYPE_" + store.detail.conditionType) }}</h3></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("CONDITION") }}</p><h3 class="c34_value">{{ store.conditionText }}</h3></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("POINTS") }}</p><h3 class="c34_value">{{ Number(store.detail.pointReward ?? 0) }}</h3></ion-label></ion-item>
				<ion-item>
					<ion-label><p>{{ tr("STATUS") }}</p></ion-label>
					<ion-badge slot="end" :color="store.detail.isActive ? 'success' : 'medium'">{{ store.detail.isActive ? tr("ACTIVE") : tr("INACTIVE") }}</ion-badge>
				</ion-item>
			</ion-list>
			<bm-empty-state v-else description="CUS34000.NOT_FOUND" />
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { CUS34000Store } from "@/store/POS/CUS/CUS34000Store";

/** Loyalty condition detail (read-only; edit lives on the list's row actions, as on the web). */
defineOptions({ name: "CUS34000" });

const { t } = useI18n();
const route = useRoute();
const tr = (key: string) => t(`CUS34000.${key}`);
const store = CUS34000Store();

useViewEnter(() => store.load(String(route.query.conditionId ?? "")));
</script>

<style scoped>
.c34_value { font-size: 14px; white-space: normal; }
</style>
