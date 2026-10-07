<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/STK30000" />
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<template v-else-if="store.detail">
				<ion-list class="scr_list" lines="full">
					<ion-item>
						<ion-label><p>{{ code }}</p><h3>{{ store.detail.inventoryName }}</h3></ion-label>
						<ion-badge slot="end" :color="stColor(store.detail.status)">{{ stLabel(store.detail.status) }}</ion-badge>
					</ion-item>
					<ion-item v-if="store.detail.reason"><ion-label><p>{{ tr("REASON") }}</p><h3>{{ store.detail.reason }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("DATE") }}</p><h3>{{ store.detail.createdAt }}</h3></ion-label></ion-item>
					<ion-item v-if="store.detail.notes"><ion-label><p>{{ tr("NOTE") }}</p><h3>{{ store.detail.notes }}</h3></ion-label></ion-item>
				</ion-list>
				<ion-list class="scr_list" lines="full">
					<ion-list-header>{{ tr("COL_NAME") }}</ion-list-header>
					<ion-item v-for="(it, i) in store.detail.items ?? []" :key="i">
						<ion-label>
							<p>{{ it.productCode }}</p>
							<h3>{{ it.productName }}</h3>
							<p>{{ tr("COL_BEFORE") }} {{ num(it.quantityBefore) }} → {{ tr("COL_AFTER") }} {{ num(it.quantityAfter) }}</p>
						</ion-label>
						<ion-note slot="end" :class="Number(it.quantityDifference) > 0 ? 'up' : 'down'">{{ signed(it.quantityDifference) }}</ion-note>
					</ion-item>
				</ion-list>
			</template>
			<bm-empty-state v-else description="STK33000.NOT_FOUND" />
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { STK33000Store } from "@/store/POS/STK/STK33000Store";

/** Adjustment detail: before/after/diff per line. */
defineOptions({ name: "STK33000" });

const { t } = useI18n();
const tr = (k: string) => t(`STK33000.${k}`);
const route = useRoute();
const store = STK33000Store();
const code = computed(() => String(route.query.adjustmentCode ?? ""));
const num = (v: unknown) => String(Number(v ?? 0));
const signed = (v: unknown) => { const n = Number(v ?? 0); return n > 0 ? `+${n}` : String(n); };

function stColor(s?: string): string {
	const k = String(s ?? "").toUpperCase();
	if (k === "APPROVED") return "success";
	return k === "PENDING" ? "primary" : "medium";
}
function stLabel(s?: string): string {
	const k = String(s ?? "").toUpperCase();
	return ["APPROVED", "PENDING", "CANCELLED"].includes(k) ? tr("STATUS_" + k) : String(s ?? "");
}

useViewEnter(() => store.load(code.value));
</script>

<style scoped>
ion-label h3 { font-size: 14px; font-weight: 600; white-space: normal; }
ion-label p { font-size: 12px; }
.up { color: var(--ion-color-success); font-weight: 600; font-size: 14px; }
.down { color: var(--ion-color-danger); font-weight: 600; font-size: 14px; }
</style>
