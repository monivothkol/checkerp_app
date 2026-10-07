<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/STK10000" />
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<template v-else-if="store.detail">
				<ion-list class="scr_list" lines="full">
					<ion-item><ion-label><p>{{ code }}</p><h3>{{ store.detail.productName }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("UNIT") }}</p><h3>{{ store.detail.unitName || "—" }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("TOTAL_QTY") }}</p><h3>{{ store.totalQty }}</h3></ion-label></ion-item>
				</ion-list>
				<ion-list class="scr_list" lines="full">
					<ion-list-header>{{ tr("COL_INVENTORY") }}</ion-list-header>
					<ion-item v-for="(r, i) in store.detail.inventories ?? []" :key="i">
						<ion-label>
							<h3>{{ r.inventoryName }}<template v-if="r.variantName"> — {{ r.variantName }}</template></h3>
							<p>{{ tr("COL_AVAILABLE") }} {{ num(r.availableQuantity) }} · {{ tr("COL_ON_HOLD") }} {{ num(r.onHoldStock) }}</p>
							<p>{{ tr("COL_AVG_COST") }} {{ money(r.averageCost) }} · {{ tr("COL_COST_VALUE") }} {{ money(r.totalCostValue) }}</p>
						</ion-label>
						<ion-note slot="end" class="stk_qty">{{ num(r.quantity) }}</ion-note>
					</ion-item>
				</ion-list>
				<ion-list v-if="store.batches.length" class="scr_list" lines="full">
					<ion-list-header>{{ tr("BATCHES") }}</ion-list-header>
					<ion-item v-for="(b, i) in store.batches" :key="b.batchId ?? i">
						<ion-label>
							<h3>{{ b.batchNo || "—" }} · {{ b.inventoryName }}</h3>
							<p :class="expiryClass(b.daysToExpiry)">{{ tr("COL_EXPIRY") }} {{ b.expiryDate || "—" }} · {{ tr("COL_DAYS_LEFT") }} {{ b.daysToExpiry ?? "—" }}</p>
							<p>{{ tr("COL_AVG_COST") }} {{ money(b.unitCost) }}</p>
						</ion-label>
						<ion-note slot="end" class="stk_qty">{{ num(b.quantityRemaining) }}</ion-note>
					</ion-item>
				</ion-list>
			</template>
			<bm-empty-state v-else description="STK13000.NOT_FOUND" />
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { STK13000Store } from "@/store/POS/STK/STK13000Store";

/** Stock detail for one product: per-inventory/variant quantities and batch lots with expiry. */
defineOptions({ name: "STK13000" });

const { t } = useI18n();
const tr = (k: string) => t(`STK13000.${k}`);
const route = useRoute();
const store = STK13000Store();
const code = computed(() => String(route.query.productCode ?? ""));
const num = (v: unknown) => String(Number(v ?? 0));
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");
function expiryClass(days?: number): string {
	if (days == null) return "";
	if (days < 0) return "stk_exp_past";
	return days <= 30 ? "stk_exp_soon" : "";
}

useViewEnter(() => store.load(code.value));
</script>

<style scoped>
ion-label h3 { font-size: 14px; font-weight: 600; white-space: normal; }
ion-label p { font-size: 12px; }
.stk_qty { font-size: 16px; font-weight: 600; }
.stk_exp_past { color: var(--ion-color-danger) !important; font-weight: 700; }
.stk_exp_soon { color: var(--ion-color-warning-shade) !important; font-weight: 600; }
</style>
