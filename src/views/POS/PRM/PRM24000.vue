<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/PRM20000" />
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<ion-list v-else-if="store.detail" class="scr_list" lines="full">
				<ion-item><ion-label><p>{{ tr("STAFF") }}</p><h3>{{ store.detail.staffName }}</h3></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("TYPE") }}</p><h3>{{ store.detail.typeName }}</h3></ion-label></ion-item>
				<ion-item>
					<ion-label><p>{{ tr("CATEGORY") }}</p></ion-label>
					<ion-badge slot="end" :color="store.detail.category === 'EARNING' ? 'success' : 'danger'">{{ tr("CAT_" + store.detail.category) }}</ion-badge>
				</ion-item>
				<ion-item><ion-label><p>{{ tr("AMOUNT") }}</p><h3>$ {{ UT.currency(store.detail.amount ?? 0, "USD") }}</h3></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("MONTH") }}</p><h3>{{ store.detail.effectiveMonth }}</h3></ion-label></ion-item>
				<ion-item>
					<ion-label><p>{{ tr("STATUS") }}</p></ion-label>
					<ion-badge slot="end" :color="store.detail.status === 'CONSUMED' ? 'success' : 'medium'">{{ tr("STATUS_" + store.detail.status) }}</ion-badge>
				</ion-item>
				<ion-item v-if="store.detail.remark"><ion-label class="ion-text-wrap"><p>{{ tr("REMARK") }}</p><h3>{{ store.detail.remark }}</h3></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("CREATED") }}</p><h3>{{ String(store.detail.createdAt ?? "").slice(0, 10) }}</h3></ion-label></ion-item>
			</ion-list>
			<bm-empty-state v-else description="PRM24000.NOT_FOUND" />
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { PRM24000Store } from "@/store/POS/PRM/PRM24000Store";

/** Payroll adjustment detail. */
defineOptions({ name: "PRM24000" });

const { t } = useI18n();
const route = useRoute();
const tr = (k: string) => t(`PRM24000.${k}`);
const store = PRM24000Store();
useViewEnter(() => store.load(String(route.query.adjustmentId ?? "")));
</script>

<style scoped>
ion-label h3 { font-size: 14px; }
</style>
