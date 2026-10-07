<template>
	<div>
		<ion-list class="scr_list" lines="full">
			<ion-item v-for="(l, i) in store.lines" :key="l.saleItemId">
				<div class="rl_line">
					<h3>{{ l.productName }}</h3>
					<p>{{ l.productCode }} · {{ sc("COL_UNIT_PRICE") }} {{ money(l.unitPrice) }}</p>
					<p>{{ sc("COL_SOLD") }} {{ l.quantitySold }} · {{ sc("COL_RETURNED") }} {{ l.alreadyReturned }} · {{ sc("COL_RETURNABLE") }} {{ l.returnableQuantity }}</p>
					<div class="rl_inputs">
						<ion-input
							:value="l.returnQty" :label="sc('COL_RETURN_QTY')" label-placement="stacked" type="number" min="0" :max="l.returnableQuantity"
							inputmode="numeric" :disabled="l.returnableQuantity <= 0" @ion-change="onQty(i, $event)" />
						<ion-input
							:value="l.refundAmount" :label="sc('COL_EST_REFUND')" label-placement="stacked" type="number" min="0" :max="store.lineCap(l)" step="0.01"
							inputmode="decimal" :disabled="l.returnQty <= 0" @ion-change="onRefund(i, $event)" />
					</div>
					<p v-if="l.returnableQuantity <= 0" class="rl_hint">{{ sc("FULLY_RETURNED") }}</p>
					<p v-else-if="l.returnQty > 0 && l.refundAmount < store.lineCap(l)" class="rl_hint">{{ sc("PARTIAL_OF") }} {{ money(store.lineCap(l)) }}</p>
				</div>
			</ion-item>
			<ion-item v-if="!store.lines.length" lines="none"><ion-note>{{ sc("NO_ITEMS") }}</ion-note></ion-item>
			<ion-item>
				<ion-textarea v-model="store.notes" :label="sc('NOTES')" label-placement="stacked" :placeholder="sc('NOTES_PH')" :rows="2" :auto-grow="true" />
			</ion-item>
		</ion-list>
		<div class="rl_total"><span>{{ sc("TOTAL_REFUND") }}</span><strong>{{ money(store.totalRefund) }}</strong></div>
	</div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { IonInputCustomEvent, InputChangeEventDetail } from "@ionic/core";
import UT from "@/core/utilities/ut";
import type { ReturnLine } from "@/models/POS/SAL/SAL21000";

/** Return-qty / refund lines shared by sale-return create (SAL21000) and edit (SAL27000). */
defineOptions({ name: "ReturnLinesFields" });

export interface ReturnLinesStore {
	lines: ReturnLine[];
	notes: string;
	totalRefund: number;
	lineCap(l: ReturnLine): number;
	setQty(i: number, v: number | null): void;
	setRefund(i: number, v: number | null): void;
}

const props = defineProps<{ store: ReturnLinesStore }>();
const { t } = useI18n();
const sc = (k: string) => t(`SAL21000.${k}`);
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");

type Ev = IonInputCustomEvent<InputChangeEventDetail>;
// The store clamps; write the clamped value back so the field shows it.
function onQty(i: number, e: Ev): void {
	props.store.setQty(i, Number(e.detail.value ?? 0));
	e.target.value = props.store.lines[i]?.returnQty;
}
function onRefund(i: number, e: Ev): void {
	props.store.setRefund(i, Number(e.detail.value ?? 0));
	e.target.value = props.store.lines[i]?.refundAmount;
}
</script>

<style scoped>
.rl_line { width: 100%; padding: 8px 0; }
.rl_line h3 { font-size: 14px; font-weight: 600; margin: 0; }
.rl_line p { font-size: 12px; color: var(--ion-color-medium); margin: 2px 0 0; }
.rl_inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.rl_hint { font-size: 12px; }
.rl_total { display: flex; justify-content: space-between; padding: 8px 16px; font-size: 16px; }
</style>
